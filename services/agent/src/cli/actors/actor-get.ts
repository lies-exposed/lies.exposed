import { GetActorInputSchema } from "@liexp/shared/lib/mcp/schemas/actors.schemas.js";
import { type CommandModule } from "../command.type.js";
import { runCliCommand } from "../run-command.js";

export const actorGet: CommandModule = {
  help: `
Usage: agent actor-get [options]

Get a single actor by UUID.

Options:
  --id=<uuid>    Actor UUID (required)
  --help         Show this help message

Output: JSON actor object
`,
  run: (ctx, args) =>
    runCliCommand(ctx, GetActorInputSchema, args, (input) => {
      ctx.logger.debug.log("actor-get input: %O", input);
      return ctx.api.Actor.Get({ Params: { id: input.id } });
    }),
};
