import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { GetEventInputSchema } from "@liexp/shared/lib/mcp/schemas/events.schemas.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { Schema } from "effect";
import { getArg } from "../args.js";
import { type CommandModule } from "../command.type.js";

export const eventGet: CommandModule = {
  help: `
Usage: agent event get [options]

Retrieve an event by UUID.

Options:
  --id=<uuid>   Event UUID (required)
  --help        Show this help message

Output: JSON event object
`,
  run: async (ctx, args) => {
    const result = await pipe(
      Schema.decodeUnknownEither(GetEventInputSchema)({
        id: getArg(args, "id"),
      }),
      fp.E.mapLeft((e) => new Error(`Invalid arguments: ${JSON.stringify(e)}`)),
      fp.TE.fromEither,
      fp.TE.chainW((input) => {
        ctx.logger.debug.log("event get input: %O", input);
        return ctx.api.Event.Get({ Params: { id: input.id as any } });
      }),
      fp.TE.tap((result) =>
        fp.TE.fromIO(() => {
          ctx.logger.debug.log("event get response: id=%s", result.data.id);
        }),
      ),
      throwTE,
    );

    // eslint-disable-next-line no-console
    console.log(JSON.stringify(result, null, 2));
  },
};
