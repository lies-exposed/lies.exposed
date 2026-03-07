import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { FindGroupsInputSchema } from "@liexp/shared/lib/mcp/schemas/groups.schemas.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { Schema } from "effect";
import { getArg } from "../args.js";
import { type CommandModule } from "../command.type.js";

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
  run: async (ctx, args) => {
    const startArg = getArg(args, "start");
    const endArg = getArg(args, "end");

    const result = await pipe(
      Schema.decodeUnknownEither(FindGroupsInputSchema)({
        query: getArg(args, "query"),
        sort: getArg(args, "sort") as any,
        order: getArg(args, "order") as any,
        start: startArg !== undefined ? Number(startArg) : undefined,
        end: endArg !== undefined ? Number(endArg) : undefined,
      }),
      fp.E.mapLeft((e) => new Error(`Invalid arguments: ${JSON.stringify(e)}`)),
      fp.TE.fromEither,
      fp.TE.chainW((input) => {
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
      fp.TE.tap((result) =>
        fp.TE.fromIO(() => {
          ctx.logger.debug.log("group list response: total=%d", result.total);
        }),
      ),
      throwTE,
    );

    // eslint-disable-next-line no-console
    console.log(JSON.stringify(result, null, 2));
  },
};
