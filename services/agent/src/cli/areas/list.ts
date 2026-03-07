import { FindAreasInputSchema } from "@liexp/shared/lib/mcp/schemas/areas.schemas.js";
import { getArg } from "../args.js";
import { type CommandModule } from "../command.type.js";
import { runCommand } from "../run-command.js";

export const areaList: CommandModule = {
  help: `
Usage: agent area list [options]

Search and list geographic areas.

Options:
  --query=<string>       Filter by label (partial match)
  --sort=<field>         Sort field: createdAt | label
  --order=<ASC|DESC>     Sort order
  --start=<number>       Pagination offset (default: 0)
  --end=<number>         Pagination limit (default: 20)
  --help                 Show this help message

Output: JSON list of area objects
`,
  run: (ctx, args) =>
    runCommand(
      ctx,
      FindAreasInputSchema,
      {
        query: getArg(args, "query"),
        sort: getArg(args, "sort"),
        order: getArg(args, "order"),
        start: getArg(args, "start"),
        end: getArg(args, "end"),
      },
      (input) => {
        ctx.logger.debug.log("area list input: %O", input);
        return ctx.api.Area.List({
          Query: {
            q: input.query,
            _sort: input.sort,
            _order: input.order,
            _start: input.start !== undefined ? String(input.start) : "0",
            _end: input.end !== undefined ? String(input.end) : "20",
          } as any,
        });
      },
    ),
};
