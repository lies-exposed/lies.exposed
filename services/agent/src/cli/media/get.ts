import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { GetMediaInputSchema } from "@liexp/shared/lib/mcp/schemas/media.schemas.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { Schema } from "effect";
import { getArg } from "../args.js";
import { type CommandModule } from "../command.type.js";

export const mediaGet: CommandModule = {
  help: `
Usage: agent media get [options]

Retrieve a media item by UUID.

Options:
  --id=<uuid>   Media UUID (required)
  --help        Show this help message

Output: JSON media object
`,
  run: async (ctx, args) => {
    const result = await pipe(
      Schema.decodeUnknownEither(GetMediaInputSchema)({
        id: getArg(args, "id"),
      }),
      fp.E.mapLeft((e) => new Error(`Invalid arguments: ${JSON.stringify(e)}`)),
      fp.TE.fromEither,
      fp.TE.chainW((input) => {
        ctx.logger.debug.log("media get input: %O", input);
        return ctx.api.Media.Get({ Params: { id: input.id as any } });
      }),
      fp.TE.tap((result) =>
        fp.TE.fromIO(() => {
          ctx.logger.debug.log("media get response: id=%s", result.data.id);
        }),
      ),
      throwTE,
    );

    // eslint-disable-next-line no-console
    console.log(JSON.stringify(result, null, 2));
  },
};
