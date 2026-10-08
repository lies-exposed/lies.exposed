import { CreateKeywordInputSchema } from "@liexp/shared/lib/mcp/schemas/keywords.schemas.js";
import { generateRandomColor } from "@liexp/shared/lib/utils/colors.js";
import { makeCommand } from "../run-command.js";

export const keywordCreate = makeCommand(
  CreateKeywordInputSchema,
  {
    usage: "keywords create",
    description: "Create a new keyword.",
    output: "JSON created keyword object",
  },
  (input, ctx) => {
    ctx.logger.debug.log("keyword-create input: %O", input);
    return ctx.api.Keyword.Create({
      Body: {
        tag: input.tag,
        color: input.color ?? generateRandomColor(),
      },
    });
  },
);
