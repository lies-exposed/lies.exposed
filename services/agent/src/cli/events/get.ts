import { GetEventInputSchema } from "@liexp/shared/lib/mcp/schemas/events.schemas.js";
import { getArg } from "../args.js";
import { type CommandModule } from "../command.type.js";
import { runCommand } from "../run-command.js";

export const eventGet: CommandModule = {
  help: `
Usage: agent event get [options]

Retrieve an event by UUID.

Options:
  --id=<uuid>   Event UUID (required)
  --help        Show this help message

Output: JSON event object
`,
  run: (ctx, args) =>
    runCommand(
      ctx,
      GetEventInputSchema,
      { id: getArg(args, "id") },
      (input) => {
        ctx.logger.debug.log("event get input: %O", input);
        return ctx.api.Event.Get({ Params: { id: input.id as any } });
      },
    ),
};
