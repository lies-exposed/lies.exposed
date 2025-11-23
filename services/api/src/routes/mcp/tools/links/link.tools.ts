import {
  CREATE_LINK,
  FIND_LINKS,
} from "@liexp/backend/lib/providers/ai/toolNames.constants.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import { effectToZodStruct } from "@liexp/shared/lib/utils/schema.utils.js";
import { type McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { flow, pipe } from "fp-ts/lib/function.js";
import { type ServerContext } from "../../../context/context.type.js";
import {
  CreateLinkInputSchema,
  createLinkToolTask,
} from "./createLink.tool.js";
import { FindLinksInputSchema, findLinksToolTask } from "./findLinks.tool.js";

export const registerLinkTools = (server: McpServer, ctx: ServerContext) => {
  server.registerTool(
    FIND_LINKS,
    {
      title: "Find link",
      description:
        "Search for links using various criteria like title or keywords. Returns the link item in JSON format",
      annotations: { tool: true },
      inputSchema: effectToZodStruct(FindLinksInputSchema),
    },
    (input) =>
      pipe(
        findLinksToolTask({
          query: input.query,
          ids: input.ids ?? [],
          sort: input.sort,
          order: input.order,
        })(ctx),
        throwTE,
      ),
  );

  server.registerTool(
    CREATE_LINK,
    {
      title: "Create link",
      description:
        "Create a new link in the database with the provided URL and metadata. Returns the created link details in structured markdown format.",
      annotations: { title: "Create link", tool: true },
      inputSchema: effectToZodStruct(CreateLinkInputSchema),
    },
    (input) => pipe(createLinkToolTask(input)(ctx), throwTE),
  );
};
