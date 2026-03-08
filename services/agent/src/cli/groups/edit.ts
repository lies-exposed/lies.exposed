import { EditGroupInputSchema } from "@liexp/shared/lib/mcp/schemas/groups.schemas.js";
import { type CommandModule } from "../command.type.js";
import { runCliCommand } from "../run-command.js";

export const groupEdit: CommandModule = {
  help: `
Usage: agent group edit [options]

Edit an existing group by UUID.

Options:
  --id=<uuid>              Group UUID (required)
  --name=<string>          Group name
  --username=<string>      Unique slug
  --kind=<Public|Private>  Group visibility
  --color=<hex>            Color hex without #
  --excerpt=<string>       Short description
  --avatar=<uuid>          Media UUID for avatar
  --startDate=<date>       Start date YYYY-MM-DD
  --endDate=<date>         End date YYYY-MM-DD
  --members=<uuid,...>     Comma-separated actor UUIDs to set as members
  --help                   Show this help message

Output: JSON updated group object
`,
  run: (ctx, args) =>
    runCliCommand(ctx, EditGroupInputSchema, args, (input) => {
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
    }),
};
