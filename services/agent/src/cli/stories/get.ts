import { GetStoryInputSchema } from "@liexp/shared/lib/mcp/schemas/stories.schemas.js";
import { type CommandModule } from "../command.type.js";
import { runCliCommand } from "../run-command.js";

export const storyGet: CommandModule = {
  help: `
Usage: agent story get [options]

Retrieve a story by UUID.

Options:
  --id=<uuid>   Story UUID (required)
  --help        Show this help message

Output: JSON story object
`,
  run: (ctx, args) =>
    runCliCommand(ctx, GetStoryInputSchema, args, (input) => {
      ctx.logger.debug.log("story get input: %O", input);
      return ctx.api.Story.Get({ Params: { id: input.id as any } });
    }),
};
