#!/usr/bin/env node

import { GetLogger } from "@liexp/core/lib/logger/index.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import { agentCommand } from "#cli/agent.command.js";
import { makeAgentContext } from "#context/load.js";

const cliLogger = GetLogger("agent-cli");

const main = async () => {
  try {
    const ctx = await throwTE(makeAgentContext("agent-cli"));

    // Run the agent command
    await agentCommand(ctx, process.argv.slice(2));
  } catch (error) {
    cliLogger.error.log("Agent CLI error:", error);
    process.exit(1);
  }
};

// Handle process events
process.on("uncaughtException", (error) => {
  cliLogger.error.log("Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  cliLogger.error.log("Unhandled Rejection:", reason);
  process.exit(1);
});

main().catch((error) => {
  cliLogger.error.log("Failed to start agent CLI:", error);
  process.exit(1);
});
