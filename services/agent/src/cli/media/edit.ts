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
    const { id, ...body } = input;
    return ctx.api.Media.Edit({
      Params: { id },
      Body: {
        ...body,
        events: body.events ?? [],
        links: body.links ?? [],
        keywords: body.keywords ?? [],
        areas: body.areas ?? [],
      },
    });
  },
);
