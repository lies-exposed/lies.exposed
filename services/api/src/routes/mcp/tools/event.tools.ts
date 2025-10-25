import { EventV2IO } from "@liexp/backend/lib/io/event/eventV2.io.js";
import { searchEventV2Query } from "@liexp/backend/lib/queries/events/searchEventsV2.query.js";
import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { fp } from "@liexp/core/lib/fp/index.js";
import { UUID } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { EventType } from "@liexp/shared/lib/io/http/Events/EventType.js";
import { effectToZodStruct } from "@liexp/shared/lib/utils/schema.utils.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import { type McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Schema } from "effect";
import * as O from "effect/Option";
import { pipe } from "fp-ts/lib/function.js";
import { type ServerContext } from "../../../context/context.type.js";
import { formatEventToMarkdown } from "./formatters/eventToMarkdown.formatter.js";

export const registerEventTools = (server: McpServer, ctx: ServerContext) => {
  server.registerTool(
    "findEvents",
    {
      title: "Find events",
      description:
        "Search for events using various criteria like title, keywords, actor and group ids. Returns the story in JSON format",
      annotations: { tool: true },
      inputSchema: effectToZodStruct(
        Schema.Struct({
          query: Schema.UndefinedOr(Schema.String),
          actors: Schema.UndefinedOr(Schema.Array(UUID)),
          groups: Schema.UndefinedOr(Schema.Array(UUID)),
          type: Schema.UndefinedOr(EventType),
        }),
      ),
    },
    async ({ query, actors, groups, type }) => {
      return pipe(
        searchEventV2Query({
          q: O.fromNullable(query),
          actors: pipe(
            actors,
            O.fromNullable,
            O.filter((actors) => actors.length > 0),
          ),
          groups: pipe(
            groups,
            O.fromNullable,
            O.filter((groups) => groups.length > 0),
          ),
          type: O.fromNullable(type ? [type] : undefined),
        })(ctx),
        LoggerService.TE.debug(ctx, `Results %O`),
        fp.TE.chainEitherK((result) => EventV2IO.decodeMany(result.results)),
        fp.TE.map((result) => ({
          content: result.map((eventResult) => {
            return {
              text: formatEventToMarkdown(eventResult),
              uri: `event://${eventResult.id}`,
              type: "text" as const,
            };
          }),
        })),
        throwTE,
      );
    },
  );
};
