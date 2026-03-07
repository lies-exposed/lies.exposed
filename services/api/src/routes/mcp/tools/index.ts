import { type McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { type ServerContext } from "../../../context/context.type.js";
import { registerBlockNoteTools } from "./blockNoteToText.tool.js";

export const registerTools = (server: McpServer, ctx: ServerContext) => {
  // All resource tools (actors, groups, areas, links, media, nations, events)
  // are handled by the agent CLI tool — no MCP tools needed.
  registerBlockNoteTools(server);
};
