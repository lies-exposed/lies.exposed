import { CreateActorInputSchema } from "@liexp/shared/lib/mcp/schemas/actors.schemas.js";
import { type CommandModule } from "../command.type.js";
import { runCliCommand } from "../run-command.js";

export const actorCreate: CommandModule = {
  help: `
Usage: agent actor-create [options]

Create a new actor.

Options:
  --username=<string>         Actor username/slug (required)
  --fullName=<string>         Actor full name (required)
  --avatar=<uuid>             Media UUID for avatar image
  --excerpt=<string>          Short biography excerpt
  --bornOn=<date>             Birth date (YYYY-MM-DD)
  --diedOn=<date>             Death date (YYYY-MM-DD)
  --color=<hex>               Color hex without #
  --nationalities=<uuid,...> Comma-separated nation UUIDs
  --body=<string>             Full biography body (HTML/markdown)
  --help                      Show this help message

Output: JSON created actor object
`,
  run: (ctx, args) =>
    runCliCommand(ctx, CreateActorInputSchema, args, (input) => {
      ctx.logger.debug.log("actor-create input: %O", input);
      return ctx.api.Actor.Create({
        Body: {
          username: input.username,
          fullName: input.fullName,
          ...(input.color !== undefined ? { color: input.color as any } : {}),
          ...(input.excerpt !== undefined ? { excerpt: input.excerpt } : {}),
          ...(input.bornOn !== undefined
            ? { bornOn: new Date(input.bornOn) }
            : {}),
          ...(input.diedOn !== undefined
            ? { diedOn: new Date(input.diedOn) }
            : {}),
          ...(input.avatar !== undefined
            ? { avatar: input.avatar as any }
            : {}),
          ...(input.nationalities !== undefined
            ? { nationalities: input.nationalities as any }
            : {}),
          ...(input.body !== undefined ? { body: input.body } : {}),
        } as any,
      });
    }),
};
