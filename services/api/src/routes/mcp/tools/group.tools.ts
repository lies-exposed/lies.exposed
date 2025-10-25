import { GroupIO } from "@liexp/backend/lib/io/group.io.js";
import { fetchGroups } from "@liexp/backend/lib/queries/groups/fetchGroups.query.js";
import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { fp } from "@liexp/core/lib/fp/index.js";
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
    "findGroups",
    {
      title: "Find groups",
      description:
        "Search for groups using various criteria like name or keywords. Returns the groups in JSON format",
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
    async ({ query, withDeleted: _withDeleted, sort, order }) => {
      return pipe(
        fetchGroups({
          q: O.fromNullable(query),
          _sort: O.fromNullable(sort),
          _order: O.fromNullable(order),
        }),
        LoggerService.RTE.debug(`Results %O`),
        fp.RTE.chainEitherK((result) => GroupIO.decodeMany(result[0])),
        fp.RTE.map((groups) => {
          return {
            content: groups.map((group) => ({
              text: formatGroupToMarkdown(group),
              type: "text" as const,
              href: `group://${group.id}`,
            })),
          };
        }),
        (rte) => throwTE(rte(ctx)),
      );
    },
  );
};
