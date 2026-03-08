import { FindLinksInputSchema } from "@liexp/shared/lib/mcp/schemas/links.schemas.js";
import { type CommandModule } from "../command.type.js";
import { runCliCommand } from "../run-command.js";

export const linkList: CommandModule = {
  help: `
Usage: agent link list [options]

Search and list links (web sources and references).

Options:
  --query=<string>       Filter by title or URL
  --sort=<field>         Sort field: createdAt | title | url
  --order=<ASC|DESC>     Sort order
  --start=<number>       Pagination offset (default: 0)
  --end=<number>         Pagination limit (default: 20)
  --help                 Show this help message

Output: JSON list of link objects
`,
  run: (ctx, args) =>
    runCliCommand(ctx, FindLinksInputSchema, args, (input) => {
      ctx.logger.debug.log("link list input: %O", input);
      return ctx.api.Link.List({
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
