import { GetGroupInputSchema } from "@liexp/shared/lib/mcp/schemas/groups.schemas.js";
import { getArg } from "../args.js";
import { type CommandModule } from "../command.type.js";
import { runCommand } from "../run-command.js";

export const groupGet: CommandModule = {
  help: `
Usage: agent group get [options]

Retrieve a group by UUID.

Options:
  --id=<uuid>   Group UUID (required)
  --help        Show this help message

Output: JSON group object
`,
  run: (ctx, args) =>
    runCommand(
      ctx,
      GetGroupInputSchema,
      { id: getArg(args, "id") },
      (input) => {
        ctx.logger.debug.log("group get input: %O", input);
        return ctx.api.Group.Get({ Params: { id: input.id as any } });
      },
    ),
};
