import { CreateGroupInputSchema } from "@liexp/shared/lib/mcp/schemas/groups.schemas.js";
import { getArg } from "../args.js";
import { type CommandModule } from "../command.type.js";
import { runCommand } from "../run-command.js";

export const groupCreate: CommandModule = {
  help: `
Usage: agent group create [options]

Create a new group.

Options:
  --name=<string>        Group name (required)
  --username=<string>    Unique slug (required)
  --kind=<Public|Private> Group visibility (required)
  --color=<hex>          Color hex without #
  --excerpt=<string>     Short description
  --avatar=<uuid>        Media UUID for avatar
  --startDate=<date>     Start date YYYY-MM-DD
  --endDate=<date>       End date YYYY-MM-DD
  --help                 Show this help message

Output: JSON created group object
`,
  run: (ctx, args) =>
    runCommand(
      ctx,
      CreateGroupInputSchema,
      {
        name: getArg(args, "name"),
        username: getArg(args, "username"),
        kind: getArg(args, "kind"),
        color: getArg(args, "color"),
        excerpt: getArg(args, "excerpt"),
        avatar: getArg(args, "avatar"),
        startDate: getArg(args, "startDate"),
        endDate: getArg(args, "endDate"),
      },
      (input) => {
        ctx.logger.debug.log("group create input: %O", input);
        return ctx.api.Group.Create({
          Body: {
            name: input.name,
            username: input.username,
            kind: input.kind,
            color: input.color as any,
            excerpt: input.excerpt as any,
            avatar: input.avatar as any,
            startDate: input.startDate ? new Date(input.startDate) : undefined,
            endDate: input.endDate ? new Date(input.endDate) : undefined,
            members: [],
          },
        });
      },
    ),
};
