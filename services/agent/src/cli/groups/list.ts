import { FindGroupsInputSchema } from "@liexp/shared/lib/mcp/schemas/groups.schemas.js";
import { type CommandModule } from "../command.type.js";
import { runCliCommand } from "../run-command.js";

export const groupList: CommandModule = {
  help: `
Usage: agent group list [options]

Search for groups in the lies.exposed database.

Options:
  --query=<string>       Filter by name
  --sort=<field>         Sort field: createdAt, name (default: createdAt)
  --order=<ASC|DESC>     Sort order (default: DESC)
  --start=<N>            Pagination offset (default: 0)
  --end=<N>              Pagination limit (default: 20)
  --help                 Show this help message

Output: JSON group list
`,
  run: (ctx, args) =>
    runCliCommand(ctx, FindGroupsInputSchema, args, (input) => {
      ctx.logger.debug.log("group list input: %O", input);
      return ctx.api.Group.List({
        Query: {
          q: input.query,
          _sort: input.sort as any,
          _order: input.order as any,
          _start: input.start !== undefined ? String(input.start) : "0",
          _end: input.end !== undefined ? String(input.end) : "20",
        },
      });
    }),
};
