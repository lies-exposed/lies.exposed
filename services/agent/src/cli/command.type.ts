import { type APIContext } from "@liexp/backend/lib/context/api.context.js";
import { type Logger } from "@liexp/core/lib/logger/Logger.js";
import { type ENV } from "#io/ENV.js";

/**
 * Minimal context for CLI commands that only call the API over HTTP.
 * Does not require MCP, LangChain, or Puppeteer to initialize.
 */
export interface CLIContext extends APIContext {
  env: ENV;
  logger: Logger;
}

type CommandFlow = (ctx: CLIContext, args: string[]) => Promise<void> | void;

export interface CommandModule {
  run: CommandFlow;
  help: string;
  /**
   * One-line usage + flags summary, e.g. "actor create --username --fullName
   * [--excerpt]". Concatenated across all commands to build the AI agent's
   * CLI tool description (see tools/cli-executor.tool.ts) — required so that
   * description can never silently omit a command.
   */
  summary: string;
}

export interface CommandGroup {
  description: string;
  commands: Record<string, CommandModule | CommandGroup>;
}

export const isCommandGroup = (a: unknown): a is CommandGroup => {
  return (
    typeof a === "object" && a !== null && "description" in a && "commands" in a
  );
};
