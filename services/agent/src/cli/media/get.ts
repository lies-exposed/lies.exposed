import { GetMediaInputSchema } from "@liexp/shared/lib/mcp/schemas/media.schemas.js";
import { makeCommand } from "../run-command.js";

export const mediaGet = makeCommand(
  GetMediaInputSchema,
  {
    usage: "media get",
    description: "Retrieve a media item by UUID.",
    output: "JSON media object",
  },
  (input, ctx) => {
    ctx.logger.debug.log("media get input: %O", input);
    return ctx.api.Media.Get({ Params: { id: input.id } });
  },
);
