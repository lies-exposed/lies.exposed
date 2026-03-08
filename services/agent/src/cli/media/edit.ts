import { EditMediaInputSchema } from "@liexp/shared/lib/mcp/schemas/media.schemas.js";
import { splitUUIDs } from "../args.js";
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
        location: input.location as any,
        type: input.type as any,
        label: input.label,
        description: input.description ?? null,
        thumbnail: input.thumbnail ? (input.thumbnail as any) : null,
        extra: null,
        events: splitUUIDs(input.events) as any[],
        links: splitUUIDs(input.links) as any[],
        keywords: splitUUIDs(input.keywords) as any[],
        areas: splitUUIDs(input.areas) as any[],
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
