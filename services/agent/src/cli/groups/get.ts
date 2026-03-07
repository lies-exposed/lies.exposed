import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { GetGroupInputSchema } from "@liexp/shared/lib/mcp/schemas/groups.schemas.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { Schema } from "effect";
import { getArg } from "../args.js";
import { type CommandModule } from "../command.type.js";

export const groupGet: CommandModule = {
  help: `
Usage: agent group get [options]

Retrieve a group by UUID.

Options:
  --id=<uuid>   Group UUID (required)
  --help        Show this help message

Output: JSON group object
`,
  run: async (ctx, args) => {
    const result = await pipe(
      Schema.decodeUnknownEither(GetGroupInputSchema)({
        id: getArg(args, "id"),
      }),
      fp.E.mapLeft((e) => new Error(`Invalid arguments: ${JSON.stringify(e)}`)),
      fp.TE.fromEither,
      fp.TE.chainW((input) => {
        ctx.logger.debug.log("group get input: %O", input);
        return ctx.api.Group.Get({ Params: { id: input.id as any } });
      }),
      fp.TE.tap((result) =>
        fp.TE.fromIO(() => {
          ctx.logger.debug.log("group get response: id=%s", result.data.id);
        }),
      ),
      throwTE,
    );

    // eslint-disable-next-line no-console
    console.log(JSON.stringify(result, null, 2));
  },
};
