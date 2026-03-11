import { CreateMediaInputSchema } from "@liexp/shared/lib/mcp/schemas/media.schemas.js";
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
        ...input,
        id: undefined,
        extra: undefined,
        events: input.events ?? [],
        links: input.links ?? [],
        keywords: input.keywords ?? [],
        areas: input.areas ?? [],
      },
    });
  },
);
