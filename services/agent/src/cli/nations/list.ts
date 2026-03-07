import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { FindNationsInputSchema } from "@liexp/shared/lib/mcp/schemas/nations.schemas.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { Schema } from "effect";
import { getArg } from "../args.js";
import { type CommandModule } from "../command.type.js";

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
  run: async (ctx, args) => {
    const result = await pipe(
      Schema.decodeUnknownEither(FindNationsInputSchema)({
        name: getArg(args, "name"),
        start: getArg(args, "start"),
        end: getArg(args, "end"),
      }),
      fp.E.mapLeft((e) => new Error(`Invalid arguments: ${JSON.stringify(e)}`)),
      fp.TE.fromEither,
      fp.TE.chainW((input) => {
        ctx.logger.debug.log("nation list input: %O", input);
        return ctx.api.Nation.List({
          Query: {
            q: input.name,
            _start: input.start !== undefined ? String(input.start) : "0",
            _end: input.end !== undefined ? String(input.end) : "20",
          } as any,
        });
      }),
      fp.TE.tap((result) =>
        fp.TE.fromIO(() => {
          ctx.logger.debug.log("nation list response: total=%d", result.total);
        }),
      ),
      throwTE,
    );

    // eslint-disable-next-line no-console
    console.log(JSON.stringify(result, null, 2));
  },
};
