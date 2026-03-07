import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { FindAreasInputSchema } from "@liexp/shared/lib/mcp/schemas/areas.schemas.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { Schema } from "effect";
import { getArg } from "../args.js";
import { type CommandModule } from "../command.type.js";

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
  run: async (ctx, args) => {
    const result = await pipe(
      Schema.decodeUnknownEither(FindAreasInputSchema)({
        query: getArg(args, "query"),
        sort: getArg(args, "sort"),
        order: getArg(args, "order"),
        start: getArg(args, "start"),
        end: getArg(args, "end"),
      }),
      fp.E.mapLeft((e) => new Error(`Invalid arguments: ${JSON.stringify(e)}`)),
      fp.TE.fromEither,
      fp.TE.chainW((input) => {
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
      }),
      fp.TE.tap((result) =>
        fp.TE.fromIO(() => {
          ctx.logger.debug.log("area list response: total=%d", result.total);
        }),
      ),
      throwTE,
    );

    // eslint-disable-next-line no-console
    console.log(JSON.stringify(result, null, 2));
  },
};
