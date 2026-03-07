import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { GetLinkInputSchema } from "@liexp/shared/lib/mcp/schemas/links.schemas.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { Schema } from "effect";
import { getArg } from "../args.js";
import { type CommandModule } from "../command.type.js";

export const linkGet: CommandModule = {
  help: `
Usage: agent link get [options]

Retrieve a link by UUID.

Options:
  --id=<uuid>   Link UUID (required)
  --help        Show this help message

Output: JSON link object
`,
  run: async (ctx, args) => {
    const result = await pipe(
      Schema.decodeUnknownEither(GetLinkInputSchema)({
        id: getArg(args, "id"),
      }),
      fp.E.mapLeft((e) => new Error(`Invalid arguments: ${JSON.stringify(e)}`)),
      fp.TE.fromEither,
      fp.TE.chainW((input) => {
        ctx.logger.debug.log("link get input: %O", input);
        return ctx.api.Link.Get({ Params: { id: input.id as any } });
      }),
      fp.TE.tap((result) =>
        fp.TE.fromIO(() => {
          ctx.logger.debug.log("link get response: id=%s", result.data.id);
        }),
      ),
      throwTE,
    );

    // eslint-disable-next-line no-console
    console.log(JSON.stringify(result, null, 2));
  },
};
