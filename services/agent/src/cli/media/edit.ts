import { EditMediaInputSchema } from "@liexp/shared/lib/mcp/schemas/media.schemas.js";
import { removeUndefinedFromPayload } from "@liexp/shared/lib/utils/fp.utils.js";
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
        ...removeUndefinedFromPayload({
          location: input.location,
          type: input.type,
          label: input.label,
          description: input.description,
          thumbnail: input.thumbnail as any,
          events: input.events as any[] | undefined,
          links: input.links as any[] | undefined,
          keywords: input.keywords as any[] | undefined,
          areas: input.areas as any[] | undefined,
        }),
        extra: null,
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
