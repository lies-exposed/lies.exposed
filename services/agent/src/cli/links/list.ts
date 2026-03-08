import { FindLinksInputSchema } from "@liexp/shared/lib/mcp/schemas/links.schemas.js";
import { makeCommand } from "../run-command.js";

export const linkList = makeCommand(
  FindLinksInputSchema,
  { usage: "link list", description: "Search and list links (web sources and references).", output: "JSON list of link objects" },
  (input, ctx) => {
    ctx.logger.debug.log("link list input: %O", input);
    return ctx.api.Link.List({
      Query: {
        q: input.query,
        _sort: input.sort,
        _order: input.order,
        _start: input.start !== undefined ? String(input.start) : "0",
        _end: input.end !== undefined ? String(input.end) : "20",
      } as any,
    });
  },
);
