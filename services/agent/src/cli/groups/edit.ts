import { EditGroupInputSchema } from "@liexp/shared/lib/mcp/schemas/groups.schemas.js";
import { getArg } from "../args.js";
import { type CommandModule } from "../command.type.js";
import { runCommand } from "../run-command.js";

export const groupEdit: CommandModule = {
  help: `
Usage: agent group edit [options]

Edit an existing group by UUID.

Options:
  --id=<uuid>            Group UUID (required)
  --name=<string>        Group name
  --username=<string>    Unique slug
  --kind=<Public|Private> Group visibility
  --color=<hex>          Color hex without #
  --excerpt=<string>     Short description
  --avatar=<uuid>        Media UUID for avatar
  --startDate=<date>     Start date YYYY-MM-DD
  --endDate=<date>       End date YYYY-MM-DD
  --members=<uuid>       Actor UUID to add as member
  --help                 Show this help message

Output: JSON updated group object
`,
  run: async (ctx, args) => {
    const membersArg = getArg(args, "members");
    return runCommand(
      ctx,
      EditGroupInputSchema,
      {
        id: getArg(args, "id"),
        name: getArg(args, "name"),
        username: getArg(args, "username"),
        kind: getArg(args, "kind") as any,
        color: getArg(args, "color"),
        excerpt: getArg(args, "excerpt"),
        avatar: getArg(args, "avatar"),
        startDate: getArg(args, "startDate"),
        endDate: getArg(args, "endDate"),
        members: membersArg ? [membersArg] : undefined,
      },
      (input) => {
        ctx.logger.debug.log("group edit input: %O", input);
        return ctx.api.Group.Edit({
          Params: { id: input.id as any },
          Body: {
            ...(input.name !== undefined ? { name: input.name } : {}),
            ...(input.username !== undefined
              ? { username: input.username }
              : {}),
            ...(input.kind !== undefined ? { kind: input.kind } : {}),
            ...(input.color !== undefined ? { color: input.color as any } : {}),
            ...(input.excerpt !== undefined
              ? { excerpt: input.excerpt as any }
              : {}),
            ...(input.avatar !== undefined
              ? { avatar: input.avatar as any }
              : {}),
            ...(input.startDate !== undefined
              ? { startDate: new Date(input.startDate) }
              : {}),
            ...(input.endDate !== undefined
              ? { endDate: new Date(input.endDate) }
              : {}),
            ...(input.members !== undefined
              ? { members: input.members as any }
              : {}),
          } as any,
        });
      },
    );
  },
};
