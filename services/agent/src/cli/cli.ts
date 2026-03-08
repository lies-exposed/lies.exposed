#!/usr/bin/env node

import { GetLogger } from "@liexp/core/lib/logger/index.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { actorGroup } from "#cli/actors/index.js";
import { agentCommand } from "#cli/agent.command.js";
import { areaGroup } from "#cli/areas/index.js";
import { type CommandGroup } from "#cli/command.type.js";
import { eventGroup } from "#cli/events/index.js";
import { groupGroup } from "#cli/groups/index.js";
import { linkGroup } from "#cli/links/index.js";
import { makeCLIContext } from "#cli/make-cli-context.js";
import { mediaGroup } from "#cli/media/index.js";
import { nationGroup } from "#cli/nations/index.js";
import { storyGroup } from "#cli/stories/index.js";
import { makeAgentContext } from "#context/load.js";

const cliLogger = GetLogger("agent-cli");

/**
 * Command groups that only need the lightweight CLI context (HTTP + env).
 * Usage: cli <group> <subcommand> [--flags]
 * Example: cli actor list --fullName=Obama
 */
const groups: Record<string, CommandGroup> = {
  actor: actorGroup,
  group: groupGroup,
  area: areaGroup,
  link: linkGroup,
  media: mediaGroup,
  nation: nationGroup,
  event: eventGroup,
  story: storyGroup,
};

const formatGroupHelp = (name: string, group: CommandGroup): string => {
  const subcommands = Object.keys(group.commands).join(", ");
  return `
Usage: agent ${name} <subcommand> [options]

${group.description}

Subcommands:
  ${subcommands}

Run "agent ${name} <subcommand> --help" for subcommand details.
`;
};

const formatTopLevelHelp = (): string => {
  const groupLines = Object.entries(groups)
    .map(([name, g]) => `  ${name.padEnd(12)} ${g.description}`)
    .join("\n");
  return `
Usage: agent <group> <subcommand> [options]
       agent agent [question]

Groups:
${groupLines}
  agent        Run the interactive AI agent

Run "agent <group> --help" for group details.
`;
};

const main = async () => {
  const [groupName, subcommand, ...args] = process.argv.slice(2);

  if (!groupName || groupName === "--help" || groupName === "-h") {
    // eslint-disable-next-line no-console
    console.log(formatTopLevelHelp());
    process.exit(0);
  }

  // Full agent path: MCP + LangChain
  if (groupName === "agent") {
    const ctx = await throwTE(makeAgentContext("agent-cli"));
    await agentCommand(ctx, [subcommand, ...args]);
    return;
  }

  const group = groups[groupName];
  if (!group) {
    cliLogger.error.log(`Unknown group: ${groupName}\n${formatTopLevelHelp()}`);
    process.exit(1);
  }

  // "agent actor --help" or "agent actor" with no subcommand
  if (!subcommand || subcommand === "--help" || subcommand === "-h") {
    // eslint-disable-next-line no-console
    console.log(formatGroupHelp(groupName, group));
    process.exit(0);
  }

  const command = group.commands[subcommand];
  if (!command) {
    const available = Object.keys(group.commands).join(", ");
    cliLogger.error.log(
      `Unknown subcommand: ${groupName} ${subcommand}\nAvailable: ${available}`,
    );
    process.exit(1);
  }

  // "agent actor list --help"
  if (args.includes("--help")) {
    // eslint-disable-next-line no-console
    console.log(command.help);
    process.exit(0);
  }

  // Lightweight path: just HTTP + env, no MCP
  const ctx = await throwTE(makeCLIContext());
  try {
    await command.run(ctx, args);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : String(error);
    process.stderr.write(
      `Error running ${groupName} ${subcommand}:\n${message}\n`,
    );
    cliLogger.error.log(`Error running ${groupName} ${subcommand}:`, error);
    process.exit(1);
  }
};

process.on("uncaughtException", (error) => {
  process.stderr.write(`Uncaught Exception: ${error.message}\n`);
  cliLogger.error.log("Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  const message = reason instanceof Error ? reason.message : String(reason);
  process.stderr.write(`Unhandled Rejection: ${message}\n`);
  cliLogger.error.log("Unhandled Rejection:", reason);
  process.exit(1);
});

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`Failed to start agent CLI: ${message}\n`);
  cliLogger.error.log("Failed to start agent CLI:", error);
  process.exit(1);
});
