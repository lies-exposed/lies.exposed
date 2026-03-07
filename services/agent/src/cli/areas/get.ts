import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { GetAreaInputSchema } from "@liexp/shared/lib/mcp/schemas/areas.schemas.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { Schema } from "effect";
import { getArg } from "../args.js";
import { type CommandModule } from "../command.type.js";

export const areaGet: CommandModule = {
  help: `
Usage: agent area get [options]

Retrieve an area by UUID.

Options:
  --id=<uuid>   Area UUID (required)
  --help        Show this help message

Output: JSON area object
`,
  run: async (ctx, args) => {
    const result = await pipe(
      Schema.decodeUnknownEither(GetAreaInputSchema)({
        id: getArg(args, "id"),
      }),
      fp.E.mapLeft((e) => new Error(`Invalid arguments: ${JSON.stringify(e)}`)),
      fp.TE.fromEither,
      fp.TE.chainW((input) => {
        ctx.logger.debug.log("area get input: %O", input);
        return ctx.api.Area.Get({ Params: { id: input.id as any } });
      }),
      fp.TE.tap((result) =>
        fp.TE.fromIO(() => {
          ctx.logger.debug.log("area get response: id=%s", result.data.id);
        }),
      ),
      throwTE,
    );

    // eslint-disable-next-line no-console
    console.log(JSON.stringify(result, null, 2));
  },
};
