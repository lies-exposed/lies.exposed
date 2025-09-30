import { fetchManyMedia } from "@liexp/backend/lib/queries/media/fetchManyMedia.query.js";
import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { fp } from "@liexp/core/lib/fp/index.js";
import { Media } from "@liexp/shared/lib/io/http/Media/Media.js";
import { MediaType } from "@liexp/shared/lib/io/http/Media/MediaType.js";
import { SortOrder } from "@liexp/shared/lib/io/http/Query/SortQuery.js";
import { effectToZodStruct } from "@liexp/shared/lib/utils/schema.utils.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import { type McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Schema } from "effect";
import * as O from "effect/Option";
import { pipe } from "fp-ts/lib/function.js";
import { type ServerContext } from "../../../context/context.type.js";
import { formatMediaToMarkdown } from "./formatters/mediaToMarkdown.formatter.js";

export const registerMediaTools = (server: McpServer, ctx: ServerContext) => {
  server.registerTool(
    "findMedia",
    {
      title: "Find media",
      description:
        "Search for media using various criteria like title or keywords. Returns the media item in JSON format",
      annotations: { tool: true },
      inputSchema: effectToZodStruct(
        Schema.Struct({
          query: Schema.String,
          type: Schema.Union(MediaType, Schema.Undefined),
          sort: Schema.Union(
            Schema.Literal("createdAt"),
            Schema.Literal("title"),
            Schema.Literal("type"),
            Schema.Undefined,
          ),
          order: Schema.Union(SortOrder, Schema.Undefined),
        }),
      ),
    },
    async ({ query, type, sort, order }) => {
      return pipe(
        fetchManyMedia({
          q: O.some(query),
          type: type ? O.some(type) : O.none(),
          _sort: sort ? O.some(sort) : O.none(),
          _order: order ? O.some(order) : O.none(),
        })(ctx),
        LoggerService.TE.debug(ctx, `Results %O`),
        fp.TE.map(([medias]) => {
          if (medias.length > 0) {
            const media = Schema.decodeUnknownSync(Media)(medias[0]);
            return {
              content: [
                {
                  text: formatMediaToMarkdown(media),
                  type: "text" as const,
                },
              ],
            };
          }
          return {
            content: [
              {
                text: "No media found matching the search criteria.",
                type: "text" as const,
              },
            ],
          };
        }),
        throwTE,
      );
    },
  );
};
