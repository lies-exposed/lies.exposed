import { CreateMediaInputSchema } from "@liexp/shared/lib/mcp/schemas/media.schemas.js";
import { splitUUIDs } from "../args.js";
import { makeCommand } from "../run-command.js";

export const mediaCreate = makeCommand(
  CreateMediaInputSchema,
  {
    usage: "media create",
    description: "Create a new media entry.",
    output: "JSON created media object",
  },
  (input, ctx) => {
    ctx.logger.debug.log("media create input: %O", input);
    return ctx.api.Media.Create({
      Body: {
        id: undefined,
        location: input.location as any,
        type: input.type as any,
        label: input.label,
        description: input.description,
        thumbnail: input.thumbnail as any,
        extra: undefined,
        events: splitUUIDs(input.events) as any[],
        links: splitUUIDs(input.links) as any[],
        keywords: splitUUIDs(input.keywords) as any[],
        areas: splitUUIDs(input.areas) as any[],
      },
    });
  },
);
