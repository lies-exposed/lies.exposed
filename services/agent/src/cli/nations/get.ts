import { GetNationInputSchema } from "@liexp/shared/lib/mcp/schemas/nations.schemas.js";
import { getArg } from "../args.js";
import { type CommandModule } from "../command.type.js";
import { runCommand } from "../run-command.js";

export const nationGet: CommandModule = {
  help: `
Usage: agent nation get [options]

Retrieve a nation by UUID.

Options:
  --id=<uuid>   Nation UUID (required)
  --help        Show this help message

Output: JSON nation object
`,
  run: (ctx, args) =>
    runCommand(
      ctx,
      GetNationInputSchema,
      { id: getArg(args, "id") },
      (input) => {
        ctx.logger.debug.log("nation get input: %O", input);
        return ctx.api.Nation.Get({ Params: { id: input.id as any } });
      },
    ),
};
