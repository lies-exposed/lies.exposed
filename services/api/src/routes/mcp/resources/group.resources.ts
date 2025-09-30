import { fetchGroups } from "@liexp/backend/lib/queries/groups/fetchGroups.query.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type UUID } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import {
  ResourceTemplate,
  type McpServer,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import * as O from "effect/Option";
import { type ServerContext } from "../../../context/context.type.js";

export const registerGroupResources = (
  server: McpServer,
  ctx: ServerContext,
) => {
  server.registerResource(
    "group",
    new ResourceTemplate("group://{id}", { list: undefined }),
    {
      title: "Get group by its id",
      description: 'Retrieve a group from DB by its "id"',
    },
    async (uri, { id }) => {
      return pipe(
        fetchGroups({
          ids: O.some([id as UUID]),
        })(ctx),
        fp.TE.map(([groups]) => ({
          contents: [
            {
              uri: uri.href,
              text: JSON.stringify(groups[0]),
            },
          ],
        })),
        throwTE,
      );
    },
  );
};
