import { CreateLinkInputSchema } from "@liexp/shared/lib/mcp/schemas/links.schemas.js";
import { makeCommand } from "../run-command.js";

export const linkCreate = makeCommand(
  CreateLinkInputSchema,
  {
    usage: "link create",
    description:
      "Create a new link by submitting its URL (metadata is auto-fetched via OpenGraph).",
    output: "JSON created link object",
  },
  (input, ctx) => {
    ctx.logger.debug.log("link create input: %O", input);
    return ctx.api.Link.Custom.Submit({
      Body: { url: input.url },
    });
  },
);
