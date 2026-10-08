import { EditKeywordInputSchema } from "@liexp/shared/lib/mcp/schemas/keywords.schemas.js";
import { makeCommand } from "../run-command.js";

export const keywordEdit = makeCommand(
  EditKeywordInputSchema,
  {
    usage: "keywords edit",
    description: "Edit an existing keyword by UUID.",
    output: "JSON updated keyword object",
  },
  (input, ctx) => {
    ctx.logger.debug.log("keyword-edit input: %O", input);
    const { id, ...rest } = input;

    // Build body - API expects CreateKeyword (tag required) but we allow partial updates
    const body: Record<string, unknown> = { ...rest };

    return ctx.api.Keyword.Edit({
      Params: { id },
      Body: body as any,
    });
  },
);
