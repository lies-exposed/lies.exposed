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

export type CommandFlow = (
  ctx: CLIContext,
  args: string[],
) => Promise<void> | void;

export interface CommandModule {
  run: CommandFlow;
  help: string;
}

export interface CommandGroup {
  description: string;
  commands: Record<string, CommandModule>;
}
