import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { FindLinksInputSchema } from "@liexp/shared/lib/mcp/schemas/links.schemas.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { Schema } from "effect";
import { getArg } from "../args.js";
import { type CommandModule } from "../command.type.js";

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
  run: async (ctx, args) => {
    const startArg = getArg(args, "start");
    const endArg = getArg(args, "end");

    const result = await pipe(
      Schema.decodeUnknownEither(FindLinksInputSchema)({
        query: getArg(args, "query"),
        sort: getArg(args, "sort"),
        order: getArg(args, "order"),
        start: startArg !== undefined ? Number(startArg) : undefined,
        end: endArg !== undefined ? Number(endArg) : undefined,
      }),
      fp.E.mapLeft((e) => new Error(`Invalid arguments: ${JSON.stringify(e)}`)),
      fp.TE.fromEither,
      fp.TE.chainW((input) => {
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
      fp.TE.tap((result) =>
        fp.TE.fromIO(() => {
          ctx.logger.debug.log("link list response: total=%d", result.total);
        }),
      ),
      throwTE,
    );

    // eslint-disable-next-line no-console
    console.log(JSON.stringify(result, null, 2));
  },
};
