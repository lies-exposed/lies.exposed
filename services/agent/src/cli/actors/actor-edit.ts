import { EditActorInputSchema } from "@liexp/shared/lib/mcp/schemas/actors.schemas.js";
import { getArg, splitUUIDs } from "../args.js";
import { type CommandModule } from "../command.type.js";
import { runCommand } from "../run-command.js";

export const actorEdit: CommandModule = {
  help: `
Usage: agent actor-edit [options]

Edit an existing actor by UUID.

Options:
  --id=<uuid>                 Actor UUID (required)
  --username=<string>         Actor username/slug
  --fullName=<string>         Actor full name
  --avatar=<uuid>             Media UUID for avatar image
  --excerpt=<string>          Short biography excerpt
  --bornOn=<date>             Birth date (YYYY-MM-DD)
  --diedOn=<date>             Death date (YYYY-MM-DD)
  --color=<hex>               Color hex without #
  --memberIn=<uuid,...>       Comma-separated group UUIDs for membership
  --nationalities=<uuid,...>  Comma-separated nation UUIDs
  --body=<string>             Full biography body (HTML/markdown)
  --help                      Show this help message

Output: JSON updated actor object
`,
  run: async (ctx, args) => {
    const memberInArg = getArg(args, "memberIn");
    const nationalitiesArg = getArg(args, "nationalities");
    return runCommand(
      ctx,
      EditActorInputSchema,
      {
        id: getArg(args, "id"),
        username: getArg(args, "username"),
        fullName: getArg(args, "fullName"),
        avatar: getArg(args, "avatar"),
        excerpt: getArg(args, "excerpt"),
        bornOn: getArg(args, "bornOn"),
        diedOn: getArg(args, "diedOn"),
        color: getArg(args, "color"),
        body: getArg(args, "body"),
        memberIn:
          memberInArg !== undefined ? splitUUIDs(memberInArg) : undefined,
        nationalities:
          nationalitiesArg !== undefined
            ? splitUUIDs(nationalitiesArg)
            : undefined,
      },
      (input) => {
        ctx.logger.debug.log("actor-edit input: %O", input);
        return ctx.api.Actor.Edit({
          Params: { id: input.id },
          Body: {
            ...(input.username !== undefined
              ? { username: input.username }
              : {}),
            ...(input.fullName !== undefined
              ? { fullName: input.fullName }
              : {}),
            ...(input.excerpt !== undefined ? { excerpt: input.excerpt } : {}),
            ...(input.body !== undefined ? { body: input.body } : {}),
            ...(input.bornOn !== undefined
              ? { bornOn: new Date(input.bornOn) }
              : {}),
            ...(input.diedOn !== undefined
              ? { diedOn: new Date(input.diedOn) }
              : {}),
            ...(input.avatar !== undefined
              ? { avatar: input.avatar as any }
              : {}),
            ...(input.color !== undefined ? { color: input.color as any } : {}),
            ...(input.memberIn !== undefined
              ? { memberIn: input.memberIn as any }
              : {}),
            ...(input.nationalities !== undefined
              ? { nationalities: input.nationalities as any }
              : {}),
          } as any,
        });
      },
    );
  },
};
