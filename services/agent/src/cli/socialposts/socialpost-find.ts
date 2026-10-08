import { FindSocialPostsInputSchema } from "@liexp/shared/lib/mcp/schemas/socialposts.schemas.js";
import { makeCommand } from "../run-command.js";

export const socialPostFind = makeCommand(
  FindSocialPostsInputSchema,
  {
    usage: "socialposts list",
    description: "Search and list social posts.",
    output: "JSON list of social post objects",
  },
  (input, ctx) => {
    ctx.logger.debug.log("socialpost-find input: %O", input);
    return ctx.api.SocialPosts.List({
      Query: {
        q: input.q,
        status: input.status,
        type: input.type,
        entity: input.entity,
        _start: input.start !== undefined ? String(input.start) : "0",
        _end: input.end !== undefined ? String(input.end) : "20",
        _sort: input.sort,
        _order: input.order,
      },
    });
  },
);
