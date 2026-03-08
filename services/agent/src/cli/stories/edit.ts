import { fp } from "@liexp/core/lib/fp/index.js";
import { EditStoryInputSchema } from "@liexp/shared/lib/mcp/schemas/stories.schemas.js";
import { makeCommand } from "../run-command.js";

export const storyEdit = makeCommand(
  EditStoryInputSchema,
  {
    usage: "story edit",
    description: "Edit an existing story by UUID.",
    output: "JSON updated story object",
  },
  (input, ctx) => {
    ctx.logger.debug.log("story edit input: %O", input);

    if (!input.id) {
      return fp.TE.left(new Error("--id is required"));
    }

    return ctx.api.Story.Edit({
      Params: { id: input.id as any },
      Body: {
        title: input.title ?? "",
        path: input.path ?? "",
        date: input.date ? new Date(input.date) : new Date(),
        draft: input.draft ?? false,
        creator: (input.creator ?? null) as any,
        featuredImage: (input.featuredImage
          ? { id: input.featuredImage as any }
          : null) as any,
        body2: [] as any,
        keywords: input.keywords,
        links: input.links,
        actors: input.actors,
        groups: input.groups,
        events: input.events,
        media: input.media,
        restore: null as any,
      },
    });
  },
);
