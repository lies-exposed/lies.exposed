import { GetLinkInputSchema } from "@liexp/shared/lib/mcp/schemas/links.schemas.js";
import { makeCommand } from "../run-command.js";

export const linkGet = makeCommand(
  GetLinkInputSchema,
  { usage: "link get", description: "Retrieve a link by UUID.", output: "JSON link object" },
  (input, ctx) => {
    ctx.logger.debug.log("link get input: %O", input);
    return ctx.api.Link.Get({ Params: { id: input.id as any } });
  },
);
