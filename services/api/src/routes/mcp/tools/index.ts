import { type McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerBlockNoteTools } from "./blockNoteToText.tool.js";

export const registerTools = (server: McpServer) => {
  // All resource tools (actors, groups, areas, links, media, nations, events)
  // are handled by the agent CLI tool — no MCP tools needed.
  registerBlockNoteTools(server);
};
