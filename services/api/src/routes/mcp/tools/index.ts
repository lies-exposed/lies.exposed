import { type McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { type ServerContext } from "../../../context/context.type.js";
import { registerActorsTools } from "./actors.tool.js";
import { registerAreasTools } from "./areas.tool.js";
import { registerBlockNoteTools } from "./blockNoteToText.tool.js";
import { registerEventsTools } from "./events.tool.js";
import { registerGroupsTools } from "./groups.tool.js";
import { registerKeywordsTools } from "./keywords.tool.js";
import { registerLinksTools } from "./links.tool.js";
import { registerMediaTools } from "./media.tool.js";
import { registerNationsTools } from "./nations.tool.js";
import { registerSettingsTools } from "./settings.tool.js";
import { registerSocialPostsTools } from "./socialPosts.tool.js";
import { registerStoriesTools } from "./stories.tool.js";

export const registerTools = (server: McpServer, ctx: ServerContext) => {
  registerActorsTools(server, ctx);
  registerAreasTools(server, ctx);
  registerBlockNoteTools(server);
  registerGroupsTools(server, ctx);
  registerLinksTools(server, ctx);
  registerMediaTools(server, ctx);
  registerNationsTools(server, ctx);
  registerEventsTools(server, ctx);
  registerSettingsTools(server, ctx);
  registerSocialPostsTools(server, ctx);
  registerStoriesTools(server, ctx);
  registerKeywordsTools(server, ctx);
};
