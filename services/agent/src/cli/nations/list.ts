import { FindNationsInputSchema } from "@liexp/shared/lib/mcp/schemas/nations.schemas.js";
import { type CommandModule } from "../command.type.js";
import { runCliCommand } from "../run-command.js";

export const nationList: CommandModule = {
  help: `
Usage: agent nation list [options]

Search and list nations.

Options:
  --name=<string>        Filter by nation name (partial match)
  --start=<number>       Pagination offset (default: 0)
  --end=<number>         Pagination limit (default: 20)
  --help                 Show this help message

Output: JSON list of nation objects
`,
  run: (ctx, args) =>
    runCliCommand(ctx, FindNationsInputSchema, args, (input) => {
      ctx.logger.debug.log("nation list input: %O", input);
      return ctx.api.Nation.List({
        Query: {
          q: input.name,
          _start: input.start !== undefined ? String(input.start) : "0",
          _end: input.end !== undefined ? String(input.end) : "20",
        } as any,
      });
    }),
};
