import { GetKeywordInputSchema } from "@liexp/shared/lib/mcp/schemas/keywords.schemas.js";
import { makeCommand } from "../run-command.js";

export const keywordGet = makeCommand(
  GetKeywordInputSchema,
  {
    usage: "keywords get",
    description: "Get a single keyword by UUID.",
    output: "JSON keyword object",
  },
  (input, ctx) => {
    ctx.logger.debug.log("keyword-get input: %O", input);
    return ctx.api.Keyword.Get({ Params: { id: input.id } });
  },
);
