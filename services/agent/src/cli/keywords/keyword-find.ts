import { FindKeywordsInputSchema } from "@liexp/shared/lib/mcp/schemas/keywords.schemas.js";
import { makeCommand } from "../run-command.js";

export const keywordFind = makeCommand(
  FindKeywordsInputSchema,
  {
    usage: "keywords list",
    description: "Search and list keywords.",
    output: "JSON list of keyword objects",
  },
  (input, ctx) => {
    ctx.logger.debug.log("keyword-find input: %O", input);
    return ctx.api.Keyword.List({
      Query: {
        q: input.q,
        ids: input.ids,
        _start: input.start !== undefined ? String(input.start) : "0",
        _end: input.end !== undefined ? String(input.end) : "20",
        _sort: input.sort,
        _order: input.order,
      },
    });
  },
);
