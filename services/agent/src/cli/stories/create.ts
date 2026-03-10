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
        title: input.title,
        path: input.path,
        date: new Date(input.date),
        draft: input.draft ?? true,
        creator: (input.creator ?? null) as any,
        featuredImage: (input.featuredImage ?? null) as any,
        body2: [] as any,
        keywords: [...(input.keywords ?? [])],
        actors: [...(input.actors ?? [])],
        groups: [...(input.groups ?? [])],
        events: [...(input.events ?? [])],
        media: [...(input.media ?? [])],
      },
    });
  },
);
