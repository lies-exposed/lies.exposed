import { type McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { type ServerContext } from "../../../context/context.type.js";
import { registerActorkResources } from "./actor.resources.js";
import { registerEventResources } from "./event.resources.js";
import { registerGroupResources } from "./group.resources.js";
import { registerLinkResources } from "./link.resources.js";
import { registerStoryResources } from "./story.resources.js";

export const registerResources = (
  server: McpServer,
  ctx: ServerContext,
): void => {
  registerActorkResources(server, ctx);
  registerGroupResources(server, ctx);
  registerStoryResources(server, ctx);
  registerEventResources(server, ctx);
  registerLinkResources(server, ctx);
};
