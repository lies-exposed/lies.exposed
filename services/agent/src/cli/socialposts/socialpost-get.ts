import { GetSocialPostInputSchema } from "@liexp/shared/lib/mcp/schemas/socialposts.schemas.js";
import { makeCommand } from "../run-command.js";

export const socialPostGet = makeCommand(
  GetSocialPostInputSchema,
  {
    usage: "socialposts get",
    description: "Get a single social post by UUID.",
    output: "JSON social post object",
  },
  (input, ctx) => {
    ctx.logger.debug.log("socialpost-get input: %O", input);
    return ctx.api.SocialPosts.Get({ Params: { id: input.id } });
  },
);
