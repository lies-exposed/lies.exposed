import { fp } from "@liexp/core/lib/fp/index.js";
import { EditStoryInputSchema } from "@liexp/shared/lib/mcp/schemas/stories.schemas.js";
import { removeUndefinedFromPayload } from "@liexp/shared/lib/utils/fp.utils.js";
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
        ...removeUndefinedFromPayload({
          title: input.title,
          path: input.path,
          date: input.date ? new Date(input.date) : undefined,
          draft: input.draft,
          creator: input.creator as any,
          featuredImage: input.featuredImage
            ? ({ id: input.featuredImage as any } as any)
            : undefined,
          keywords: input.keywords as any[] | undefined,
          links: input.links as any[] | undefined,
          actors: input.actors as any[] | undefined,
          groups: input.groups as any[] | undefined,
          events: input.events as any[] | undefined,
          media: input.media as any[] | undefined,
        }),
        body2: [] as any,
        restore: null as any,
      } as any,
    });
  },
);
