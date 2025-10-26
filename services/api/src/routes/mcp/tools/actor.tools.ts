import { ActorIO } from "@liexp/backend/lib/io/Actor.io.js";
import { fetchActors } from "@liexp/backend/lib/queries/actors/fetchActors.query.js";
import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { fp } from "@liexp/core/lib/fp/index.js";
import type { AddActorBody } from "@liexp/shared/lib/io/http/Actor.js";
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
import { formatActorToMarkdown } from "./formatters/actorToMarkdown.formatter.js";

export const registerActorTools = (server: McpServer, ctx: ServerContext) => {
  const inputSchema = effectToZodStruct(
    Schema.Struct({
      fullName: Schema.UndefinedOr(Schema.String),
      memberIn: Schema.UndefinedOr(Schema.Array(UUID)),
      withDeleted: Schema.UndefinedOr(Schema.Boolean),
      sort: Schema.UndefinedOr(
        Schema.Union(
          Schema.Literal("createdAt"),
          Schema.Literal("fullName"),
          Schema.Literal("username"),
        ),
      ),
      order: Schema.UndefinedOr(
        Schema.Union(Schema.Literal("ASC"), Schema.Literal("DESC")),
      ),
      start: Schema.UndefinedOr(Schema.Number).annotations({
        description: "Pagination start index",
      }),
      end: Schema.UndefinedOr(Schema.Number).annotations({
        description: "Pagination end index",
      }),
    }),
  );

  server.registerTool(
    "findActors",
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
          q: fullName ? O.some(fullName) : O.none(),
          memberIn: memberIn?.length ? O.some(memberIn) : O.none(),
          withDeleted:
            withDeleted !== undefined ? O.some(withDeleted) : O.none(),
          _sort: O.fromNullable(sort),
          _order: O.fromNullable(order),
          _start: O.fromNullable(start),
          _end: O.fromNullable(end),
        })(ctx),
        LoggerService.TE.debug(ctx, `Results %O`),
        fp.TE.chainEitherK((result) => ActorIO.decodeMany(result.results)),
        fp.TE.map((actors) => ({
          content: actors.map((actor) => ({
            text: formatActorToMarkdown(actor),
            type: "text" as const,
            href: `actor://${actor.id}`,
          })),
        })),
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
      excerpt: Schema.NullOr(Schema.String).annotations({
        description: "Short description of the actor as plain text or null",
      }),
      nationalities: Schema.Array(UUID).annotations({
        description: "Array of nationality UUIDs",
      }),
      body: Schema.NullOr(Schema.String).annotations({
        description: "Full body content as plain text or null",
      }),
      avatar: Schema.NullOr(UUID).annotations({
        description: "Avatar media UUID or null",
      }),
      bornOn: Schema.NullOr(Schema.String).annotations({
        description: "Birth date in ISO format (YYYY-MM-DD) or null",
      }),
      diedOn: Schema.NullOr(Schema.String).annotations({
        description: "Death date in ISO format (YYYY-MM-DD) or null",
      }),
    }),
  );

  server.registerTool(
    "createActor",
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
      const actorBody: AddActorBody = {
        username,
        fullName,
        color,
        excerpt: excerpt ? toInitialValue(excerpt) : toInitialValue(""),
        nationalities: nationalities ?? [],
        body: body ? toInitialValue(body) : undefined,
        avatar: avatar ?? undefined,
        bornOn: bornOn ? new Date(bornOn) : undefined,
        diedOn: diedOn ? new Date(diedOn) : undefined,
      };

      return pipe(
        createActor(actorBody)(ctx),
        LoggerService.TE.debug(ctx, "Created actor %O"),
        fp.TE.map((actor) => {
          if ("success" in (actor as any)) {
            return {
              content: [
                {
                  text: "Actor creation process initiated successfully.",
                  type: "text" as const,
                },
              ],
            };
          }
          const typedActor = actor as any;
          return {
            content: [
              {
                text: formatActorToMarkdown(typedActor),
                type: "text" as const,
                href: `actor://${typedActor.id}`,
              },
            ],
          };
        }),
        throwTE,
      );
    },
  );
};
