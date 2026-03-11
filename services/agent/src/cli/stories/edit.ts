import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type BlockNoteDocument } from "@liexp/io/lib/http/Common/BlockNoteDocument.js";
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

    const { id, featuredImage, date, ...body } = input;
    return pipe(
      ctx.api.Story.Get({ Params: { id } }),
      fp.TE.chain((existing) =>
        ctx.api.Story.Edit({
          Params: { id },
          Body: {
            title: body.title ?? existing.data.title,
            path: body.path ?? existing.data.path,
            draft: body.draft ?? existing.data.draft,
            creator: existing.data.creator!,
            date: date ?? existing.data.date.toISOString(),
            featuredImage: featuredImage
              ? { id: featuredImage }
              : existing.data.featuredImage
                ? { id: existing.data.featuredImage.id }
                : null,
            body: body.body ?? (existing.data.body as BlockNoteDocument),
            keywords: body.keywords ?? [...existing.data.keywords],
            links: body.links ?? [...existing.data.links],
            groups: body.groups ?? [...existing.data.groups],
            actors: body.actors ?? [...existing.data.actors],
            events: body.events ?? [...existing.data.events],
            media: body.media ?? [...existing.data.media],
            restore: null,
          },
        }),
      ),
    );
  },
);
