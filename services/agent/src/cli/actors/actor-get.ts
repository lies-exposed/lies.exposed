import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { GetActorInputSchema } from "@liexp/shared/lib/mcp/schemas/actors.schemas.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { Schema } from "effect";
import { type CommandModule } from "../command.type.js";

const getArg = (args: string[], key: string): string | undefined =>
  args
    .find((a) => a.startsWith(`--${key}=`))
    ?.split("=")
    .slice(1)
    .join("=");

export const actorGet: CommandModule = {
  help: `
Usage: agent actor-get [options]

Get a single actor by UUID.

Options:
  --id=<uuid>    Actor UUID (required)
  --help         Show this help message

Output: JSON actor object
`,
  run: async (ctx, args) => {
    const result = await pipe(
      Schema.decodeUnknownEither(GetActorInputSchema)({
        id: getArg(args, "id"),
      }),
      fp.E.mapLeft((e) => new Error(`Invalid arguments: ${JSON.stringify(e)}`)),
      fp.TE.fromEither,
      fp.TE.chainW((input) => {
        ctx.logger.debug.log("actor-get input: %O", input);
        return ctx.api.Actor.Get({ Params: { id: input.id } });
      }),
      fp.TE.tap((result) =>
        fp.TE.fromIO(() => {
          ctx.logger.debug.log("actor-get response: id=%s", result.data.id);
        }),
      ),
      throwTE,
    );

    // eslint-disable-next-line no-console
    console.log(JSON.stringify(result, null, 2));
  },
};
