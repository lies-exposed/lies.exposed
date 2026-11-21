import { randomUUID } from "node:crypto";
import type { ActorEntity } from "@liexp/backend/lib/entities/Actor.entity.js";
import {
  FIND_ACTORS,
  CREATE_ACTOR,
  EDIT_ACTOR,
} from "@liexp/backend/lib/providers/ai/toolNames.constants.js";
import { fetchActors } from "@liexp/backend/lib/queries/actors/fetchActors.query.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import type {
  Actor,
  CreateActorBody,
  GetListActorQuery,
} from "@liexp/io/lib/http/Actor.js";
import { BlockNoteDocument } from "@liexp/io/lib/http/Common/BlockNoteDocument.js";
import type { UUID } from "@liexp/io/lib/http/Common/UUID.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Schema } from "effect";
import * as O from "effect/Option";
import { defineMcpTool } from "./helpers.js";
import type { ServerContext } from "#context/context.type.js";
import { createActor } from "#flows/actors/createActor.flow.js";
import { editActor } from "#flows/actors/editActor.flow.js";

const wrap = <A>(a: A | undefined): O.Option<A> => O.fromNullable(a);

const decodeBlockNote = Schema.decodeUnknownSync(BlockNoteDocument);

const toParagraphBlocks = (
  content: string | undefined,
): O.Option<BlockNoteDocument> =>
  content === undefined
    ? O.none()
    : O.some(
        decodeBlockNote([
          {
            type: "paragraph",
            id: randomUUID(),
            props: {},
            content: [{ type: "text", text: content }],
            children: [],
          },
        ]),
      );

const toIds = (relations: readonly ActorRelation[] | null | undefined) =>
  (relations ?? []).map((r) => (typeof r === "string" ? r : r.id));

/** Accepts both the TypeORM entity and the decoded `Actor` IO type */
type ActorRelation = { id: string } | string;

const actorToOutput = (actor: ActorEntity | Actor) => ({
  id: actor.id,
  username: actor.username,
  fullName: actor.fullName,
  color: actor.color ?? undefined,
  excerpt: actor.excerpt ?? undefined,
  nationalities: toIds(actor.nationalities),
  body: actor.body ?? undefined,
  avatar: actor.avatar
    ? typeof actor.avatar === "string"
      ? actor.avatar
      : (actor.avatar as { id: string }).id
    : undefined,
  bornOn: actor.bornOn ?? undefined,
  diedOn: actor.diedOn ?? undefined,
  memberIn: toIds(actor.memberIn),
  createdAt: actor.createdAt.toISOString(),
  updatedAt: actor.updatedAt.toISOString(),
});

export const registerActorsTools = (server: McpServer, ctx: ServerContext) => {
  // --- findActors ---
  const findActorsTool = defineMcpTool(
    Schema.Struct({
      fullName: Schema.UndefinedOr(Schema.String).annotations({
        description: "Full name to search for (partial match supported)",
      }),
      memberIn: Schema.optional(Schema.Array(Schema.String)).annotations({
        description: "Array of group UUIDs the actor is a member of",
      }),
      withDeleted: Schema.UndefinedOr(Schema.Boolean).annotations({
        description: "Include deleted actors in the search results",
      }),
      sort: Schema.optional(
        Schema.Union(
          Schema.Literal("fullName"),
          Schema.Literal("username"),
          Schema.Literal("createdAt"),
          Schema.Literal("updatedAt"),
        ),
      ).annotations({
        description:
          'Sort field: "createdAt", "fullName", or "username". Defaults to createdAt',
      }),
      order: Schema.optional(
        Schema.Union(Schema.Literal("ASC"), Schema.Literal("DESC")),
      ).annotations({
        description: 'Sort order: "ASC" for ascending or "DESC" for descending',
      }),
      start: Schema.optional(Schema.Number).annotations({
        description: "Pagination start index",
      }),
      end: Schema.optional(Schema.Number).annotations({
        description: "Pagination end index",
      }),
    }),
    async (input) => {
      const { fullName, memberIn, withDeleted, sort, order, start, end } =
        input;

      // fetchActors expects effect Options for every query field
      const actorQuery: Partial<GetListActorQuery> = {
        ...(fullName ? { q: O.some(fullName) } : {}),
        ...(memberIn && memberIn.length > 0
          ? {
              memberIn: O.some(memberIn as readonly UUID[]),
            }
          : {}),
        ...(withDeleted !== undefined
          ? { withDeleted: O.some(withDeleted) }
          : {}),
        ...(sort ? { _sort: O.some(sort) } : {}),
        ...(order ? { _order: O.some(order) } : {}),
        ...(start !== undefined ? { _start: O.some(Number(start)) } : {}),
        ...(end !== undefined ? { _end: O.some(Number(end)) } : {}),
      };

      try {
        const te = fetchActors(actorQuery)(ctx);
        const result = await pipe(
          te,
          fp.TE.map(({ total, results }) => ({
            actors: results.map(actorToOutput),
            total,
          })),
        )();

        if (fp.E.isLeft(result)) {
          throw new Error(
            (result.left as Error).message ?? "Failed to find actors",
          );
        }

        return {
          content: [
            {
              text: JSON.stringify(result.right),
              type: "text" as const,
            },
          ],
        };
      } catch (err) {
        ctx.logger.error.log("findActors error: %O", err);
        throw new Error(
          `Failed to find actors: ${err instanceof Error ? err.message : String(err)}`,
          { cause: err },
        );
      }
    },
  );

  server.registerTool(
    FIND_ACTORS,
    {
      title: "Find actors",
      description:
        "Search and list actors in the database with filtering, sorting, and pagination.",
      annotations: { title: "Find actors", readOnlyHint: true },
      inputSchema: findActorsTool.inputSchema,
    },
    findActorsTool.handler,
  );

  // --- createActor ---
  const createActorTool = defineMcpTool(
    Schema.Struct({
      username: Schema.String.annotations({
        description: "Unique username for the actor (required)",
      }),
      fullName: Schema.String.annotations({
        description: "Full name of the actor (required)",
      }),
      color: Schema.String.annotations({
        description: "Hex color without # (required)",
      }),
      excerpt: Schema.optional(Schema.Any).annotations({
        description:
          "Short description as BlockNote document (array of blocks with type, id, props, content, children)",
      }),
      nationalities: Schema.optional(Schema.Array(Schema.String)).annotations({
        description: "Array of nationality UUIDs (default: [])",
      }),
      body: Schema.optional(Schema.Any).annotations({
        description:
          "Full body content as BlockNote document (array of blocks with type, id, props, content, children)",
      }),
      avatar: Schema.optional(Schema.String).annotations({
        description: "Avatar media UUID (default: null)",
      }),
      bornOn: Schema.optional(Schema.String).annotations({
        description: "Birth date in ISO format (YYYY-MM-DD) (default: null)",
      }),
      diedOn: Schema.optional(Schema.String).annotations({
        description: "Death date in ISO format (YYYY-MM-DD) (default: null)",
      }),
      memberIn: Schema.optional(Schema.Array(Schema.String)).annotations({
        description: "Array of group memberships as UUIDs (default: [])",
      }),
    }),
    async (input) => {
      try {
        // MCP input carries unbranded strings/dates; the createActor flow
        // validates them at runtime via its own schema guard.
        const createBody: CreateActorBody = {
          username: input.username,
          fullName: input.fullName,
          color: input.color,
          excerpt: input.excerpt,
          nationalities: (input.nationalities ?? []) as readonly UUID[],
          body: input.body,
          avatar: input.avatar as UUID | undefined,
          bornOn:
            input.bornOn !== undefined ? new Date(input.bornOn) : undefined,
          diedOn:
            input.diedOn !== undefined ? new Date(input.diedOn) : undefined,
        };

        const te = createActor(createBody)(ctx);
        const result = await pipe(
          te,
          fp.TE.map((r) => ("success" in r ? r : actorToOutput(r))),
        )();

        if (fp.E.isLeft(result)) {
          throw new Error(
            (result.left as Error).message ?? "Failed to create actor",
          );
        }

        return {
          content: [
            {
              text: JSON.stringify(result.right),
              type: "text" as const,
            },
          ],
        };
      } catch (err) {
        ctx.logger.error.log("createActor error: %O", err);
        throw new Error(
          `Failed to create actor: ${err instanceof Error ? err.message : String(err)}`,
          { cause: err },
        );
      }
    },
  );

  server.registerTool(
    CREATE_ACTOR,
    {
      title: "Create actor",
      description:
        "Create a new actor in the database. Provide username, fullName, and optional fields.",
      annotations: { title: "Create actor", destructiveHint: true },
      inputSchema: createActorTool.inputSchema,
    },
    createActorTool.handler,
  );

  // --- editActor ---
  const editActorTool = defineMcpTool(
    Schema.Struct({
      id: Schema.String.annotations({
        description: "ID of the actor to edit (required)",
      }),
      username: Schema.UndefinedOr(Schema.String).annotations({
        description: "New username or null to keep current",
      }),
      fullName: Schema.UndefinedOr(Schema.String).annotations({
        description: "New full name or null to keep current",
      }),
      color: Schema.UndefinedOr(Schema.String).annotations({
        description: "New hex color without # or null to keep current",
      }),
      excerpt: Schema.UndefinedOr(Schema.String).annotations({
        description: "New short description or null to keep current",
      }),
      nationalities: Schema.UndefinedOr(
        Schema.Array(Schema.String),
      ).annotations({
        description: "New nationality UUIDs or undefined to keep current",
      }),
      body: Schema.UndefinedOr(Schema.String).annotations({
        description: "New body content or null to keep current",
      }),
      avatar: Schema.UndefinedOr(Schema.String).annotations({
        description: "New avatar media UUID or null to keep current",
      }),
      bornOn: Schema.UndefinedOr(Schema.String).annotations({
        description:
          "Birth date in ISO format (YYYY-MM-DD) or null to keep current",
      }),
      diedOn: Schema.UndefinedOr(Schema.String).annotations({
        description:
          "Death date in ISO format (YYYY-MM-DD) or null to keep current",
      }),
      memberIn: Schema.UndefinedOr(Schema.Array(Schema.String)).annotations({
        description:
          "Array of group memberships as UUIDs or undefined to keep current",
      }),
    }),
    async (input) => {
      const {
        id,
        username,
        fullName,
        color,
        excerpt,
        nationalities,
        body,
        avatar,
        bornOn,
        diedOn,
        memberIn,
      } = input;

      if (!id) {
        throw new Error("Actor ID is required");
      }

      try {
        // Build EditActorInput for the flow. The MCP tool takes plain strings
        // (BlockNote documents are passed as raw text, dates as ISO strings);
        // `as` casts adapt them to the flow's branded/Option input shape, which
        // the flow validates at runtime.
        const excerptDoc = toParagraphBlocks(excerpt);
        const bodyDoc = toParagraphBlocks(body);

        const flowInput = {
          id: id as UUID,
          username: wrap(username),
          fullName: wrap(fullName),
          color: wrap(color),
          excerpt: excerptDoc,
          nationalities: wrap(nationalities?.map((n) => n as UUID)),
          body: bodyDoc,
          avatar: wrap(avatar as UUID | undefined),
          bornOn: wrap(bornOn),
          diedOn: wrap(diedOn),
          memberIn: wrap(memberIn as never),
        };

        // Call editActor flow with context
        const te = editActor(flowInput)(ctx);
        const result = await pipe(
          te,
          fp.TE.map((r) => actorToOutput(r)),
        )();

        if (fp.E.isLeft(result)) {
          throw new Error(
            (result.left as Error).message ?? "Failed to edit actor",
          );
        }

        return {
          content: [
            {
              text: JSON.stringify(result.right),
              type: "text" as const,
            },
          ],
        };
      } catch (err) {
        ctx.logger.error.log("editActor error: %O", err);
        throw new Error(
          `Failed to edit actor: ${err instanceof Error ? err.message : String(err)}`,
          { cause: err },
        );
      }
    },
  );

  server.registerTool(
    EDIT_ACTOR,
    {
      title: "Edit actor",
      description:
        "Update an existing actor in the database. Provide the actor ID and any fields to update.",
      annotations: { title: "Edit actor", destructiveHint: true },
      inputSchema: editActorTool.inputSchema,
    },
    editActorTool.handler,
  );
};
