import { GetStoryInputSchema } from "@liexp/shared/lib/mcp/schemas/stories.schemas.js";
import { makeCommand } from "../run-command.js";

export const storyGet = makeCommand(
  GetStoryInputSchema,
  {
    usage: "story get",
    description: "Retrieve a story by UUID.",
    output: "JSON story object",
  },
  (input, ctx) => {
    ctx.logger.debug.log("story get input: %O", input);
    return ctx.api.Story.Get({ Params: { id: input.id as any } });
  },
);
