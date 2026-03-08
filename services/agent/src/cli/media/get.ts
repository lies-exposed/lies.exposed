import { GetMediaInputSchema } from "@liexp/shared/lib/mcp/schemas/media.schemas.js";
import { type CommandModule } from "../command.type.js";
import { runCliCommand } from "../run-command.js";

export const mediaGet: CommandModule = {
  help: `
Usage: agent media get [options]

Retrieve a media item by UUID.

Options:
  --id=<uuid>   Media UUID (required)
  --help        Show this help message

Output: JSON media object
`,
  run: (ctx, args) =>
    runCliCommand(ctx, GetMediaInputSchema, args, (input) => {
      ctx.logger.debug.log("media get input: %O", input);
      return ctx.api.Media.Get({ Params: { id: input.id as any } });
    }),
};
