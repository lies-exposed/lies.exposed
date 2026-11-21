import { actorGroup } from "./actors/index.js";
import { areaGroup } from "./areas/index.js";
import { type CommandGroup } from "./command.type.js";
import { eventGroup } from "./events/index.js";
import { graphGroup } from "./graphs/index.js";
import { groupGroup } from "./groups/index.js";
import { keywordGroup } from "./keywords/index.js";
import { linkGroup } from "./links/index.js";
import { mediaGroup } from "./media/index.js";
import { nationGroup } from "./nations/index.js";
import { settingGroup } from "./settings/index.js";
import { socialPostGroup } from "./socialposts/index.js";
import { storyGroup } from "./stories/index.js";

/**
 * Command groups that only need the lightweight CLI context (HTTP + env).
 * Usage: agent <group> <subcommand> [--flags]
 * Example: agent actor list --fullName=Obama
 *
 * Single source of truth for the CLI's dispatch table (cli.ts).
 */
export const groups: Record<string, CommandGroup> = {
  actor: actorGroup,
  group: groupGroup,
  area: areaGroup,
  link: linkGroup,
  media: mediaGroup,
  nation: nationGroup,
  event: eventGroup,
  story: storyGroup,
  socialposts: socialPostGroup,
  keywords: keywordGroup,
  graphs: graphGroup,
  settings: settingGroup,
};
