import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { GetNationInputSchema } from "@liexp/shared/lib/mcp/schemas/nations.schemas.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { Schema } from "effect";
import { getArg } from "../args.js";
import { type CommandModule } from "../command.type.js";

export const nationGet: CommandModule = {
  help: `
Usage: agent nation get [options]

Retrieve a nation by UUID.

Options:
  --id=<uuid>   Nation UUID (required)
  --help        Show this help message

Output: JSON nation object
`,
  run: async (ctx, args) => {
    const result = await pipe(
      Schema.decodeUnknownEither(GetNationInputSchema)({
        id: getArg(args, "id"),
      }),
      fp.E.mapLeft((e) => new Error(`Invalid arguments: ${JSON.stringify(e)}`)),
      fp.TE.fromEither,
      fp.TE.chainW((input) => {
        ctx.logger.debug.log("nation get input: %O", input);
        return ctx.api.Nation.Get({ Params: { id: input.id as any } });
      }),
      fp.TE.tap((result) =>
        fp.TE.fromIO(() => {
          ctx.logger.debug.log("nation get response: id=%s", result.data.id);
        }),
      ),
      throwTE,
    );

    // eslint-disable-next-line no-console
    console.log(JSON.stringify(result, null, 2));
  },
};
