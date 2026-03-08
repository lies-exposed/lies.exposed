import { FindStoriesInputSchema } from "@liexp/shared/lib/mcp/schemas/stories.schemas.js";
import { makeCommand } from "../run-command.js";

export const storyList = makeCommand(
  FindStoriesInputSchema,
  { usage: "story list", description: "Search and list stories.", output: "JSON list of story objects" },
  (input, ctx) => {
    ctx.logger.debug.log("story list input: %O", input);
    return ctx.api.Story.List({
      Query: {
        q: input.query ?? null,
        draft: input.draft ?? null,
        creator: input.creator ?? null,
        _start: input.start !== undefined ? String(input.start) : "0",
        _end: input.end !== undefined ? String(input.end) : "20",
      } as any,
    });
  },
);
