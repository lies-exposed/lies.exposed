import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { CreateLinkInputSchema } from "@liexp/shared/lib/mcp/schemas/links.schemas.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { Schema } from "effect";
import { getArg } from "../args.js";
import { type CommandModule } from "../command.type.js";

export const linkCreate: CommandModule = {
  help: `
Usage: agent link create [options]

Create a new link by submitting its URL (metadata is auto-fetched via OpenGraph).

Options:
  --url=<string>   URL of the link (required)
  --help           Show this help message

Output: JSON created link object
`,
  run: async (ctx, args) => {
    const result = await pipe(
      Schema.decodeUnknownEither(CreateLinkInputSchema)({
        url: getArg(args, "url"),
      }),
      fp.E.mapLeft((e) => new Error(`Invalid arguments: ${JSON.stringify(e)}`)),
      fp.TE.fromEither,
      fp.TE.chainW((input) => {
        ctx.logger.debug.log("link create input: %O", input);
        return ctx.api.Link.Custom.Submit({
          Body: { url: input.url as any },
        });
      }),
      fp.TE.tap((result) =>
        fp.TE.fromIO(() => {
          ctx.logger.debug.log("link create response: id=%s", result.data.id);
        }),
      ),
      throwTE,
    );

    // eslint-disable-next-line no-console
    console.log(JSON.stringify(result, null, 2));
  },
};
