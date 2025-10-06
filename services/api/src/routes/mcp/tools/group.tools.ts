import { fetchGroups } from "@liexp/backend/lib/queries/groups/fetchGroups.query.js";
import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { fp } from "@liexp/core/lib/fp/index.js";
import { Group } from "@liexp/shared/lib/io/http/Group.js";
import { effectToZodStruct } from "@liexp/shared/lib/utils/schema.utils.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import { type McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Schema } from "effect";
import * as O from "effect/Option";
import { pipe } from "fp-ts/lib/function.js";
import { type ServerContext } from "../../../context/context.type.js";
import { formatGroupToMarkdown } from "./formatters/groupToMarkdown.formatter.js";

export const registerGroupTools = (server: McpServer, ctx: ServerContext) => {
  server.registerTool(
    "findGroup",
    {
      title: "Find group",
      description:
        "Search for a group using various criteria like name or keywords. Returns the group in JSON format",
      annotations: { tool: true },
      inputSchema: effectToZodStruct(
        Schema.Struct({
          query: Schema.String,
          withDeleted: Schema.Union(Schema.Boolean, Schema.Undefined),
          sort: Schema.Union(
            Schema.Union(Schema.Literal("createdAt"), Schema.Literal("name")),
            Schema.Undefined,
          ),
          order: Schema.Union(
            Schema.Union(Schema.Literal("ASC"), Schema.Literal("DESC")),
            Schema.Undefined,
          ),
        }),
      ),
    },
    async ({ query, withDeleted, sort, order }) => {
      return pipe(
        fetchGroups({
          q: O.fromNullable(query),
          _sort: O.fromNullable(sort),
          _order: O.fromNullable(order),
        })(ctx),
        LoggerService.TE.debug(ctx, `Results %O`),
        fp.TE.map(([groups]) => {
          if (groups.length > 0) {
            const group = Schema.decodeUnknownSync(Group)(groups[0]);
            return {
              content: [
                {
                  text: formatGroupToMarkdown(group),
                  type: "text" as const,
                },
              ],
            };
          }
          return {
            content: [
              {
                text: "No groups found matching the search criteria.",
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
