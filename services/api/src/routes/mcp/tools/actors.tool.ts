import type { ActorEntity } from "@liexp/backend/lib/entities/Actor.entity.js";
import {
  FIND_ACTORS,
  CREATE_ACTOR,
  EDIT_ACTOR,
} from "@liexp/backend/lib/providers/ai/toolNames.constants.js";
import { fetchActors } from "@liexp/backend/lib/queries/actors/fetchActors.query.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { effectToZodStruct } from "@liexp/shared/lib/utils/schema.utils.js";
import type { GetListActorQuery } from "@liexp/io/lib/http/Actor.js";
import type { UUID } from "@liexp/io/lib/http/Common/UUID.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Schema } from "effect";
import * as O from "effect/Option";
import type { ServerContext } from "#context/context.type.js";
import { createActor } from "#flows/actors/createActor.flow.js";
import { editActor } from "#flows/actors/editActor.flow.js";

const actorToOutput = (actor: ActorEntity) => ({
  id: actor.id,
  username: actor.username,
  fullName: actor.fullName,
  color: actor.color ?? undefined,
  excerpt: actor.excerpt ?? undefined,
  nationalities: ((actor.nationalities ?? []) as { id: string }[]).map(
    (n) => n.id,
  ),
  body: actor.body ?? undefined,
  avatar: actor.avatar
    ? typeof actor.avatar === "string"
      ? actor.avatar
      : actor.avatar.id
    : undefined,
  bornOn: actor.bornOn ?? undefined,
  diedOn: actor.diedOn ?? undefined,
  memberIn: ((actor.memberIn ?? []) as { id: string }[]).map((m) => m.id),
  createdAt: actor.createdAt.toISOString(),
  updatedAt: actor.updatedAt.toISOString(),
});

export const registerActorsTools = (server: McpServer, ctx: ServerContext) => {
  // --- findActors ---
  const findActorsInputSchema = effectToZodStruct(
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
  );

  server.registerTool(
    FIND_ACTORS,
    {
      title: "Find actors",
      description:
        "Search and list actors in the database with filtering, sorting, and pagination.",
      annotations: { title: "Find actors", readOnlyHint: true },
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion, @typescript-eslint/no-explicit-any
      inputSchema: findActorsInputSchema as unknown as {
        fullName?: any;
        memberIn?: any;
        withDeleted?: any;
        sort?: any;
        order?: any;
        start?: any;
        end?: any;
      },
    },
    async (opts) => {
      const { fullName, memberIn, withDeleted, sort, order, start, end } =
        opts ?? {};

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

  // --- createActor ---
  const createActorInputSchema = effectToZodStruct(
    Schema.Struct({
      username: Schema.String.annotations({
        description: "Unique username for the actor (required)",
      }),
      fullName: Schema.String.annotations({
        description: "Full name of the actor (required)",
      }),
      color: Schema.optional(Schema.String).annotations({
        description: "Hex color without # (default: random)",
      }),
      excerpt: Schema.optional(Schema.String).annotations({
        description: "Short description as plain text (default: null)",
      }),
      nationalities: Schema.optional(Schema.Array(Schema.String)).annotations({
        description: "Array of nationality UUIDs (default: [])",
      }),
      body: Schema.optional(Schema.String).annotations({
        description: "Full body content as plain text (default: null)",
      }),
      avatar: Schema.optional(Schema.String).annotations({
        description: "Avatar media UUID (default: null)",
      }),
      bornOn: Schema.optional(Schema.String).annotations({
        description: "Birth date in ISO format YYYY-MM-DD (default: null)",
      }),
      diedOn: Schema.optional(Schema.String).annotations({
        description: "Death date in ISO format YYYY-MM-DD (default: null)",
      }),
    }),
  );

  server.registerTool(
    CREATE_ACTOR,
    {
      title: "Create actor",
      description:
        "Create a new actor in the database. Accepts username and fullName as required fields, with optional metadata like color, dates, and media.",
      annotations: { title: "Create actor", destructiveHint: true },
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion, @typescript-eslint/no-explicit-any
      inputSchema: createActorInputSchema as unknown as {
        username?: any;
        fullName?: any;
        color?: any;
        excerpt?: any;
        nationalities?: any;
        body?: any;
        avatar?: any;
        bornOn?: any;
        diedOn?: any;
      },
    },
    async (opts) => {
      const {
        username,
        fullName,
        color,
        excerpt,
        nationalities,
        body,
        avatar,
        bornOn,
        diedOn,
      } = opts ?? {};

      if (!username || !fullName) {
        throw new Error("username and fullName are required");
      }

      try {
        // Build AddActorBody for direct creation
        const bodyInput: Record<string, unknown> = {
          username,
          fullName,
        };
        if (color) bodyInput.color = color;
        if (excerpt) bodyInput.excerpt = excerpt;
        if (nationalities && nationalities.length > 0) {
          bodyInput.nationalities = nationalities;
        }
        if (body) bodyInput.body = body;
        if (avatar) bodyInput.avatar = avatar;
        if (bornOn) bodyInput.bornOn = new Date(bornOn);
        if (diedOn) bodyInput.diedOn = new Date(diedOn);

        // Call createActor flow with context
        const te = createActor(bodyInput as Parameters<typeof createActor>[0])(
          ctx,
        );
        const result = await pipe(
          te,
          fp.TE.map((r) =>
            "success" in r ? r : actorToOutput(r as unknown as ActorEntity),
          ),
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

  // --- editActor ---
  const editActorInputSchema = effectToZodStruct(
    Schema.Struct({
      id: Schema.String.annotations({
        description: "UUID of the actor to edit",
      }),
      username: Schema.UndefinedOr(Schema.String).annotations({
        description: "Unique username for the actor or null to keep current",
      }),
      fullName: Schema.UndefinedOr(Schema.String).annotations({
        description: "Full name of the actor or null to keep current",
      }),
      color: Schema.UndefinedOr(Schema.String).annotations({
        description:
          "Color associated with the actor (hex format, without #) or null to keep current",
      }),
      excerpt: Schema.UndefinedOr(Schema.String).annotations({
        description:
          "Short description of the actor as plain text or null to keep current",
      }),
      nationalities: Schema.UndefinedOr(
        Schema.Array(Schema.String),
      ).annotations({
        description: "Array of nationality UUIDs or undefined to keep current",
      }),
      body: Schema.UndefinedOr(Schema.String).annotations({
        description: "Full body content as plain text or null to keep current",
      }),
      avatar: Schema.UndefinedOr(Schema.String).annotations({
        description: "Avatar media UUID or null to keep current",
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
  );

  server.registerTool(
    EDIT_ACTOR,
    {
      title: "Edit actor",
      description:
        "Update an existing actor in the database. Provide the actor ID and any fields to update.",
      annotations: { title: "Edit actor", destructiveHint: true },
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion, @typescript-eslint/no-explicit-any
      inputSchema: editActorInputSchema as unknown as {
        id?: any;
        username?: any;
        fullName?: any;
        color?: any;
        excerpt?: any;
        nationalities?: any;
        body?: any;
        avatar?: any;
        bornOn?: any;
        diedOn?: any;
        memberIn?: any;
      },
    },
    async (opts) => {
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
      } = opts ?? {};

      if (!id) {
        throw new Error("Actor ID is required");
      }

      try {
        // Build EditActorInput for the flow
        const flowInput: Record<string, unknown> = { id };
        if (username !== undefined) flowInput.username = username;
        if (fullName !== undefined) flowInput.fullName = fullName;
        if (color !== undefined) flowInput.color = color;
        if (excerpt !== undefined) flowInput.excerpt = excerpt;
        if (nationalities !== undefined)
          flowInput.nationalities = nationalities;
        if (body !== undefined) flowInput.body = body;
        if (avatar !== undefined) flowInput.avatar = avatar;
        if (bornOn !== undefined) flowInput.bornOn = bornOn;
        if (diedOn !== undefined) flowInput.diedOn = diedOn;
        if (memberIn !== undefined) flowInput.memberIn = memberIn;

        // Call editActor flow with context
        const te = editActor(
          flowInput as unknown as Parameters<typeof editActor>[0],
        )(ctx);
        const result = await pipe(
          te,
          fp.TE.map((r) => actorToOutput(r as unknown as ActorEntity)),
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
};
