import { AreaIO } from "@liexp/backend/lib/io/Area.io.js";
import { fetchAreas } from "@liexp/backend/lib/queries/areas/fetchAreas.query.js";
import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { fp } from "@liexp/core/lib/fp/index.js";
import { effectToZodStruct } from "@liexp/shared/lib/utils/schema.utils.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import { type McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Schema } from "effect";
import * as O from "effect/Option";
import { pipe } from "fp-ts/lib/function.js";
import { type ServerContext } from "../../../context/context.type.js";
import { formatAreaToMarkdown } from "./formatters/areaToMarkdown.formatter.js";

export const registerAreaTools = (server: McpServer, ctx: ServerContext) => {
  server.registerTool(
    "findAreas",
    {
      title: "Find area",
      description:
        "Search for areas using various criteria like name or keywords. Returns the area in JSON format",
      annotations: { tool: true },
      inputSchema: effectToZodStruct(
        Schema.Struct({
          query: Schema.String,
          withDeleted: Schema.UndefinedOr(Schema.Boolean),
          sort: Schema.Union(
            Schema.Literal("createdAt"),
            Schema.Literal("label"),
            Schema.Undefined,
          ),
          order: Schema.Union(
            Schema.Literal("ASC"),
            Schema.Literal("DESC"),
            Schema.Undefined,
          ),
          start: Schema.UndefinedOr(Schema.Number).annotations({
            description: "Pagination start index",
          }),
          end: Schema.UndefinedOr(Schema.Number).annotations({
            description: "Pagination end index",
          }),
        }),
      ),
    },
    async ({ query, withDeleted, sort, order, start, end }) => {
      return pipe(
        fetchAreas(
          {
            q: O.some(query),
            _sort: sort ? O.some(sort) : O.none(),
            _order: order ? O.some(order) : O.none(),
            ids: O.none(),
            draft: O.none(),
            withDeleted: O.fromNullable(withDeleted),
            _start: O.fromNullable(start),
            _end: O.fromNullable(end),
          },
          false,
        )(ctx),
        LoggerService.TE.debug(ctx, `Results %O`),
        fp.TE.chainEitherK(([areas]) => AreaIO.decodeMany(areas)),
        fp.TE.map((decodedAreas) => {
          return {
            content: [
              {
                text: decodedAreas
                  .map(formatAreaToMarkdown)
                  .join("\n\n---\n\n"),
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
