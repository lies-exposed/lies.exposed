import { CreateStoryInputSchema } from "@liexp/shared/lib/mcp/schemas/stories.schemas.js";
import { makeCommand } from "../run-command.js";

export const storyCreate = makeCommand(
  CreateStoryInputSchema,
  {
    usage: "story create",
    description: "Create a new story.",
    output: "JSON created story object",
  },
  (input, ctx) => {
    ctx.logger.debug.log("story create input: %O", input);
    return ctx.api.Story.Create({
      Body: {
        ...input,
        date: new Date(input.date).toISOString(),
        draft: input.draft ?? true,
        creator: input.creator ?? null,
        featuredImage: input.featuredImage ?? null,
        body: [] as any,
        keywords: input.keywords ?? [],
        actors: input.actors ?? [],
        groups: input.groups ?? [],
        events: input.events ?? [],
        media: input.media ?? [],
      },
    });
  },
);
