import { GetGroupInputSchema } from "@liexp/shared/lib/mcp/schemas/groups.schemas.js";
import { type CommandModule } from "../command.type.js";
import { runCliCommand } from "../run-command.js";

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
    runCliCommand(ctx, GetGroupInputSchema, args, (input) => {
      ctx.logger.debug.log("group get input: %O", input);
      return ctx.api.Group.Get({ Params: { id: input.id as any } });
    }),
};
