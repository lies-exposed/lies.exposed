import { FindMediaInputSchema } from "@liexp/shared/lib/mcp/schemas/media.schemas.js";
import { type CommandModule } from "../command.type.js";
import { runCliCommand } from "../run-command.js";

export const mediaList: CommandModule = {
  help: `
Usage: agent media list [options]

Search and list media (images, videos, files).

Options:
  --query=<string>       Filter by label or description
  --sort=<field>         Sort field: createdAt | label
  --order=<ASC|DESC>     Sort order
  --start=<number>       Pagination offset (default: 0)
  --end=<number>         Pagination limit (default: 20)
  --help                 Show this help message

Output: JSON list of media objects
`,
  run: (ctx, args) =>
    runCliCommand(ctx, FindMediaInputSchema, args, (input) => {
      ctx.logger.debug.log("media list input: %O", input);
      return ctx.api.Media.List({
        Query: {
          q: input.query,
          _sort: input.sort,
          _order: input.order,
          _start: input.start !== undefined ? String(input.start) : "0",
          _end: input.end !== undefined ? String(input.end) : "20",
        } as any,
      });
    }),
};
