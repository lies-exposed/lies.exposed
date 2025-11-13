import { ActorIO } from "@liexp/backend/lib/io/Actor.io.js";
import {
  CREATE_ACTOR,
  EDIT_ACTOR,
  FIND_ACTORS,
} from "@liexp/backend/lib/providers/ai/toolNames.constants.js";
import { fetchActors } from "@liexp/backend/lib/queries/actors/fetchActors.query.js";
import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { fp } from "@liexp/core/lib/fp/index.js";
import { AddActorBody } from "@liexp/shared/lib/io/http/Actor.js";
import { UUID } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { toInitialValue } from "@liexp/shared/lib/providers/blocknote/utils.js";
import { effectToZodStruct } from "@liexp/shared/lib/utils/schema.utils.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import { type McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Schema } from "effect";
import * as O from "effect/Option";
import { pipe } from "fp-ts/lib/function.js";
import { type ServerContext } from "../../../context/context.type.js";
import { createActor } from "../../../flows/actors/createActor.flow.js";
import { editActor } from "../../../flows/actors/editActor.flow.js";
import { toControllerError } from "../../../io/ControllerError.js";
import { formatActorToMarkdown } from "./formatters/actorToMarkdown.formatter.js";

export const registerActorTools = (server: McpServer, ctx: ServerContext) => {
  // Simplified schema for xAI compatibility - avoid nested unions
  const inputSchema = effectToZodStruct(
    Schema.Struct({
      fullName: Schema.UndefinedOr(Schema.String).annotations({
        description: "Full name to search for (partial match supported)",
      }),
      memberIn: Schema.Array(UUID).annotations({
        description: "Array of group UUIDs the actor is a member of",
      }),
      withDeleted: Schema.UndefinedOr(Schema.Boolean).annotations({
        description: "Include deleted actors in the search results",
      }),
      sort: Schema.Union(
        Schema.Literal("username"),
        Schema.Literal("createdAt"),
        Schema.Literal("updatedAt"),
        Schema.Undefined,
      ).annotations({
        description:
          'Sort field: "createdAt", "fullName", or "username". Defaults to createdAt',
      }),
      order: Schema.Union(
        Schema.Literal("ASC"),
        Schema.Literal("DESC"),
        Schema.Undefined,
      ).annotations({
        description: 'Sort order: "ASC" for ascending or "DESC" for descending',
      }),
      start: Schema.UndefinedOr(Schema.Number).annotations({
        description: "Pagination start index",
      }),
      end: Schema.UndefinedOr(Schema.Number).annotations({
        description: "Pagination end index",
      }),
    }),
  );

  server.registerTool(
    FIND_ACTORS,
    {
      title: "Find actors",
      description:
        "Search for persons in DB using various criteria like full name, username, or associated keywords. Returns the actor details in structured markdown format that is optimized for LLM understanding",
      annotations: { title: "Find actor", tool: true },
      inputSchema,
    },
    async ({ fullName, memberIn, withDeleted, sort, order, start, end }) => {
      return pipe(
        fetchActors({
          q: O.fromNullable(fullName),
          memberIn: pipe(
            O.some(memberIn),
            O.filter((arr) => arr.length > 0),
          ),
          withDeleted: O.fromNullable(withDeleted),
          _sort: O.fromNullable(sort),
          _order: O.fromNullable(order),
          _start: O.fromNullable(start),
          _end: O.fromNullable(end),
        })(ctx),
        LoggerService.TE.debug(ctx, `Results %O`),
        fp.TE.chainEitherK((result) => ActorIO.decodeMany(result.results)),
        fp.TE.map((actors) => {
          if (actors.length === 0) {
            return {
              content: [
                {
                  text: `No actors found matching the search criteria${fullName ? ` for "${fullName}"` : ""}.`,
                  type: "text" as const,
                },
              ],
            };
          }
          return {
            content: actors.map((actor) => ({
              text: formatActorToMarkdown(actor),
              type: "text" as const,
              href: `actor://${actor.id}`,
            })),
          };
        }),
        throwTE,
      );
    },
  );

  const createInputSchema = effectToZodStruct(
    Schema.Struct({
      username: Schema.String.annotations({
        description: "Unique username for the actor",
      }),
      fullName: Schema.String.annotations({
        description: "Full name of the actor",
      }),
      color: Schema.String.annotations({
        description: "Color associated with the actor (hex format, without #)",
      }),
      excerpt: Schema.UndefinedOr(Schema.String).annotations({
        description: "Short description of the actor as plain text or null",
      }),
      nationalities: Schema.Array(UUID).annotations({
        description: "Array of nationality UUIDs",
      }),
      body: Schema.UndefinedOr(Schema.String).annotations({
        description: "Full body content as plain text or null",
      }),
      avatar: UUID.annotations({
        description: "Avatar media UUID or null",
      }),
      bornOn: Schema.UndefinedOr(Schema.String).annotations({
        description: "Birth date in ISO format (YYYY-MM-DD) or undefined",
      }),
      diedOn: Schema.UndefinedOr(Schema.String).annotations({
        description: "Death date in ISO format (YYYY-MM-DD) or undefined",
      }),
    }),
  );

  server.registerTool(
    CREATE_ACTOR,
    {
      title: "Create actor",
      description:
        "Create a new actor (person) in the database with the provided information. Returns the created actor details in structured markdown format.",
      annotations: { title: "Create actor", tool: true },
      inputSchema: createInputSchema,
    },
    async ({
      username,
      fullName,
      color,
      excerpt,
      nationalities,
      body,
      avatar,
      bornOn,
      diedOn,
    }) => {
      const actorBody = {
        username,
        fullName,
        color,
        excerpt: excerpt ? toInitialValue(excerpt) : toInitialValue(""),
        nationalities: nationalities ?? [],
        body: body ? toInitialValue(body) : undefined,
        avatar: avatar ?? undefined,
        bornOn: bornOn ?? undefined,
        diedOn: pipe(
          O.fromNullable(diedOn),
          O.filter((date) => date !== ""),
          O.getOrUndefined,
        ),
      };

      return pipe(
        Schema.decodeUnknownEither(AddActorBody)(actorBody),
        fp.E.mapLeft(toControllerError),
        fp.TE.fromEither,
        fp.TE.chain((body) => createActor(body)(ctx)),
        LoggerService.TE.debug(ctx, "Created actor %O"),
        fp.TE.map((actor) => {
          if ("success" in actor) {
            return {
              content: [
                {
                  text: "Actor creation process initiated successfully.",
                  type: "text" as const,
                },
              ],
            };
          }

          return {
            content: [
              {
                text: formatActorToMarkdown(actor),
                type: "text" as const,
                href: `actor://${actor.id}`,
              },
            ],
          };
        }),
        throwTE,
      );
    },
  );

  const editInputSchema = effectToZodStruct(
    Schema.Struct({
      id: UUID.annotations({
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
      nationalities: Schema.Array(UUID).annotations({
        description: "Array of nationality UUIDs or null to keep current",
      }),
      body: Schema.UndefinedOr(Schema.String).annotations({
        description: "Full body content as plain text or null to keep current",
      }),
      avatar: Schema.UndefinedOr(UUID).annotations({
        description: "Avatar media UUID or null to keep current",
      }),
      bornOn: Schema.UndefinedOr(Schema.String).annotations({
        description:
          "Birth date in ISO format (YYYY-MM-DD) or null to keep current",
      }),
      diedOn: Schema.UndefinedOr(Schema.String).annotations({
        description:
          "Death date in ISO format (YYYY-MM-DD) or undefined to keep current",
      }),
      memberIn: Schema.Array(Schema.Union(UUID)).annotations({
        description:
          "Array of group memberships (as UUIDs or detailed objects) or null to keep current",
      }),
    }),
  );

  server.registerTool(
    EDIT_ACTOR,
    {
      title: "Edit actor",
      description:
        "Edit an existing actor (person) in the database with the provided information. Only provided fields will be updated. Returns the updated actor details in structured markdown format.",
      annotations: { title: "Edit actor", tool: true },
      inputSchema: editInputSchema,
    },
    async ({
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
    }) => {
      return pipe(
        editActor({
          id,
          username: O.fromNullable(username),
          fullName: O.fromNullable(fullName),
          color: O.fromNullable(color),
          excerpt: pipe(
            O.fromNullable(excerpt),
            O.map((e) => toInitialValue(e)),
          ),
          nationalities: pipe(
            O.fromNullable(nationalities),
            O.map((n) => [...n]),
          ),
          body: pipe(
            O.fromNullable(body),
            O.map((b) => toInitialValue(b)),
          ),
          avatar: O.fromNullable(avatar),
          bornOn: O.fromNullable(bornOn),
          diedOn: O.fromNullable(diedOn),
          memberIn: pipe(
            O.fromNullable(memberIn),
            O.filter((members) => members.length > 0),
          ),
        })(ctx),
        LoggerService.TE.debug(ctx, "Updated actor %O"),
        fp.TE.map((actor) => ({
          content: [
            {
              text: formatActorToMarkdown(actor),
              type: "text" as const,
              href: `actor://${actor.id}`,
            },
          ],
        })),
        throwTE,
      );
    },
  );
};
