import { type McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { type ServerContext } from "../../../context/context.type.js";
import { registerActorTools } from "./actors/actor.tools.js";
import { registerAreaTools } from "./areas/area.tools.js";
import { registerBlockNoteTools } from "./blockNoteToText.tool.js";
import { registerEventTools } from "./events/event.tools.js";
import { registerGroupTools } from "./groups/group.tools.js";
import { registerLinkTools } from "./links/link.tools.js";
import { registerMediaTools } from "./media/media.tools.js";

export const registerTools = (server: McpServer, ctx: ServerContext) => {
  registerActorTools(server, ctx);
  registerAreaTools(server, ctx);
  registerGroupTools(server, ctx);
  registerMediaTools(server, ctx);
  registerEventTools(server, ctx);
  registerLinkTools(server, ctx);
  registerBlockNoteTools(server);
};
