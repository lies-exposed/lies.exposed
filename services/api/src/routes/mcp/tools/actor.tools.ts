import { ActorIO } from "@liexp/backend/lib/io/Actor.io.js";
import { fetchActors } from "@liexp/backend/lib/queries/actors/fetchActors.query.js";
import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { fp } from "@liexp/core/lib/fp/index.js";
import { UUID } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { effectToZodStruct } from "@liexp/shared/lib/utils/schema.utils.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import { type McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Schema } from "effect";
import * as O from "effect/Option";
import { pipe } from "fp-ts/lib/function.js";
import { type ServerContext } from "../../../context/context.type.js";
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
};
