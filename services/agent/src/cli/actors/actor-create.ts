import { CreateActorInputSchema } from "@liexp/shared/lib/mcp/schemas/actors.schemas.js";
import { getArg, splitUUIDs } from "../args.js";
import { type CommandModule } from "../command.type.js";
import { runCommand } from "../run-command.js";

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
  --nationalityIds=<uuid,...> Comma-separated nation UUIDs
  --body=<string>             Full biography body (HTML/markdown)
  --help                      Show this help message

Output: JSON created actor object
`,
  run: async (ctx, args) => {
    const nationalityIdsArg = getArg(args, "nationalityIds");
    return runCommand(
      ctx,
      CreateActorInputSchema,
      {
        username: getArg(args, "username"),
        fullName: getArg(args, "fullName"),
        avatar: getArg(args, "avatar"),
        excerpt: getArg(args, "excerpt"),
        bornOn: getArg(args, "bornOn"),
        diedOn: getArg(args, "diedOn"),
        color: getArg(args, "color"),
        nationalityIds:
          nationalityIdsArg !== undefined
            ? splitUUIDs(nationalityIdsArg)
            : undefined,
        body: getArg(args, "body"),
      },
      (input) => {
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
            ...(input.nationalityIds !== undefined
              ? { nationalityIds: input.nationalityIds as any }
              : {}),
            ...(input.body !== undefined ? { body: input.body } : {}),
          } as any,
        });
      },
    );
  },
};
