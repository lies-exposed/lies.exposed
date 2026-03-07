import { EditActorInputSchema } from "@liexp/shared/lib/mcp/schemas/actors.schemas.js";
import { getArg } from "../args.js";
import { type CommandModule } from "../command.type.js";
import { runCommand } from "../run-command.js";

export const actorEdit: CommandModule = {
  help: `
Usage: agent actor-edit [options]

Edit an existing actor by UUID.

Options:
  --id=<uuid>            Actor UUID (required)
  --username=<string>    Actor username/slug
  --fullName=<string>    Actor full name
  --avatar=<uuid>        Media UUID for avatar image
  --excerpt=<string>     Short biography excerpt
  --bornOn=<date>        Birth date (YYYY-MM-DD)
  --diedOn=<date>        Death date (YYYY-MM-DD)
  --color=<hex>          Color hex without #
  --memberIn=<uuid>      Group UUID to add membership
  --help                 Show this help message

Output: JSON updated actor object
`,
  run: async (ctx, args) => {
    const memberInArg = getArg(args, "memberIn");
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
        memberIn: memberInArg ? [memberInArg] : undefined,
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
            ...(input.bornOn !== undefined
              ? { bornOn: new Date(input.bornOn) }
              : {}),
            ...(input.diedOn !== undefined
              ? { diedOn: new Date(input.diedOn) }
              : {}),
            ...(input.avatar !== undefined
              ? { avatar: input.avatar as any }
              : {}),
            ...(input.memberIn !== undefined
              ? { memberIn: input.memberIn as any }
              : {}),
          } as any,
        });
      },
    );
  },
};
