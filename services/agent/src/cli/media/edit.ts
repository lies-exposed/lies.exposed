import { EditMediaInputSchema } from "@liexp/shared/lib/mcp/schemas/media.schemas.js";
import { makeCommand } from "../run-command.js";

export const mediaEdit = makeCommand(
  EditMediaInputSchema,
  {
    usage: "media edit",
    description: "Edit an existing media entry by UUID.",
    output: "JSON updated media object",
  },
  (input, ctx) => {
    ctx.logger.debug.log("media edit input: %O", input);
    return ctx.api.Media.Edit({
      Params: { id: input.id },
      Body: {
        location: input.location,
        type: input.type,
        label: input.label,
        description: input.description ?? null,
        thumbnail: input.thumbnail ? (input.thumbnail as any) : null,
        extra: null,
        events: input.events,
        links: input.links,
        keywords: input.keywords,
        areas: input.areas,
        creator: null,
        overrideThumbnail: null,
        overrideExtra: null,
        transfer: null,
        transferThumbnail: null,
        restore: null,
      } as any,
    });
  },
);
