import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { CreateActorInputSchema } from "@liexp/shared/lib/mcp/schemas/actors.schemas.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { Schema } from "effect";
import { type CommandModule } from "../command.type.js";

const getArg = (args: string[], key: string): string | undefined =>
  args
    .find((a) => a.startsWith(`--${key}=`))
    ?.split("=")
    .slice(1)
    .join("=");

export const actorCreate: CommandModule = {
  help: `
Usage: agent actor-create [options]

Create a new actor.

Options:
  --username=<string>    Actor username/slug (required)
  --fullName=<string>    Actor full name (required)
  --avatar=<uuid>        Media UUID for avatar image
  --excerpt=<string>     Short biography excerpt
  --bornOn=<date>        Birth date (YYYY-MM-DD)
  --diedOn=<date>        Death date (YYYY-MM-DD)
  --color=<hex>          Color hex without #
  --help                 Show this help message

Output: JSON created actor object
`,
  run: async (ctx, args) => {
    const result = await pipe(
      Schema.decodeUnknownEither(CreateActorInputSchema)({
        username: getArg(args, "username"),
        fullName: getArg(args, "fullName"),
        config: {
          avatar: getArg(args, "avatar"),
          excerpt: getArg(args, "excerpt"),
          bornOn: getArg(args, "bornOn"),
          diedOn: getArg(args, "diedOn"),
          color: getArg(args, "color"),
        },
      }),
      fp.E.mapLeft((e) => new Error(`Invalid arguments: ${JSON.stringify(e)}`)),
      fp.TE.fromEither,
      fp.TE.chainW((input) => {
        ctx.logger.debug.log("actor-create input: %O", input);
        return ctx.api.Actor.Create({
          Body: {
            username: input.username,
            fullName: input.fullName,
            ...(input.config?.excerpt !== undefined
              ? { excerpt: input.config.excerpt }
              : {}),
            ...(input.config?.bornOn !== undefined
              ? { bornOn: new Date(input.config.bornOn) }
              : {}),
            ...(input.config?.diedOn !== undefined
              ? { diedOn: new Date(input.config.diedOn) }
              : {}),
            ...(input.config?.avatar !== undefined
              ? { avatar: input.config.avatar as any }
              : {}),
          } as any,
        });
      }),
      fp.TE.tap((result) =>
        fp.TE.fromIO(() => {
          ctx.logger.debug.log("actor-create response: %O", result.data);
        }),
      ),
      throwTE,
    );

    // eslint-disable-next-line no-console
    console.log(JSON.stringify(result, null, 2));
  },
};
