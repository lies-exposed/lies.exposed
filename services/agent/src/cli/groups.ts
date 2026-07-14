import { actorGroup } from "./actors/index.js";
import { areaGroup } from "./areas/index.js";
import {
  isCommandGroup,
  type CommandGroup,
  type CommandModule,
} from "./command.type.js";
import { eventGroup } from "./events/index.js";
import { groupGroup } from "./groups/index.js";
import { linkGroup } from "./links/index.js";
import { mediaGroup } from "./media/index.js";
import { nationGroup } from "./nations/index.js";
import { storyGroup } from "./stories/index.js";

/**
 * Command groups that only need the lightweight CLI context (HTTP + env).
 * Usage: agent <group> <subcommand> [--flags]
 * Example: agent actor list --fullName=Obama
 *
 * Single source of truth for the CLI's dispatch table (cli.ts) and for the
 * AI agent's CLI tool description (tools/cli-executor.tool.ts) — see
 * describeCommandTree below.
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
};

/**
 * Flattens the command-group tree into the compact one-line-per-command
 * summary table used by the AI agent's CLI tool description. Recurses into
 * nested groups (e.g. event's per-type subgroups) so newly added command
 * types are picked up automatically — no hand-maintained list to fall out of
 * sync with the actual dispatch table.
 */
export const describeCommandTree = (
  tree: Record<string, CommandGroup | CommandModule> = groups,
): string => {
  const lines: string[] = [];
  for (const node of Object.values(tree)) {
    if (isCommandGroup(node)) {
      lines.push(describeCommandTree(node.commands));
    } else {
      lines.push(`  ${node.summary}`);
    }
  }
  return lines.join("\n");
};
