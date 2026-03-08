import { GetAreaInputSchema } from "@liexp/shared/lib/mcp/schemas/areas.schemas.js";
import { type CommandModule } from "../command.type.js";
import { runCliCommand } from "../run-command.js";

export const areaGet: CommandModule = {
  help: `
Usage: agent area get [options]

Retrieve an area by UUID.

Options:
  --id=<uuid>   Area UUID (required)
  --help        Show this help message

Output: JSON area object
`,
  run: (ctx, args) =>
    runCliCommand(ctx, GetAreaInputSchema, args, (input) => {
      ctx.logger.debug.log("area get input: %O", input);
      return ctx.api.Area.Get({ Params: { id: input.id as any } });
    }),
};
