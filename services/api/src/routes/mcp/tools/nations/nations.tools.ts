import {
  FIND_NATIONS,
  GET_NATION,
} from "@liexp/backend/lib/providers/ai/toolNames.constants.js";
import { throwRTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { effectToZodStruct } from "@liexp/shared/lib/utils/schema.utils.js";
import { type McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { pipe } from "fp-ts/lib/function.js";
import { type ServerContext } from "../../../../context/context.type.js";
import {
  FindNationsInputSchema,
  findNationsToolTask,
} from "./findNations.tool.js";
import { GetNationInputSchema, getNationToolTask } from "./getNation.tool.js";

export const registerNationTools = (server: McpServer, ctx: ServerContext) => {
  server.registerTool(
    FIND_NATIONS,
    {
      title: "Find nations",
      description:
        "Search for nations/nationalities/countries using various criteria like name or ISO code. ALWAYS use this tool to find nationality IDs before using them in actor operations. Returns nation details in structured markdown format. Common searches: 'United States', 'Italy', 'France', 'Germany', 'China', 'Russia', etc.",
      annotations: { title: "Find nations" },
      inputSchema: effectToZodStruct(FindNationsInputSchema),
    },
    (input) =>
      pipe(
        findNationsToolTask({
          name: input.name,
          isoCode: input.isoCode,
        }),
        throwRTE(ctx),
      ),
  );

  server.registerTool(
    GET_NATION,
    {
      title: "Get nation",
      description:
        "Retrieve a nation/nationality/country by its ID. Returns the nation details in structured markdown format.",
      annotations: { title: "Get nation" },
      inputSchema: effectToZodStruct(GetNationInputSchema),
    },
    (input) =>
      pipe(
        getNationToolTask({
          id: input.id,
        }),
        throwRTE(ctx),
      ),
  );
};
