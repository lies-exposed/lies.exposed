import { EditSettingInputSchema } from "@liexp/shared/lib/mcp/schemas/settings.schemas.js";
import { makeCommand } from "../run-command.js";

export const settingEdit = makeCommand(
  EditSettingInputSchema,
  {
    usage: "settings edit",
    description: "Edit an existing setting by key.",
    output: "JSON updated setting object",
  },
  (input, ctx) => {
    ctx.logger.debug.log("setting-edit input: %O", input);
    const { id, ...rest } = input;

    // Build body - API expects specific field types (strings for dates/values)
    const body = {
      ...(rest.key !== undefined && { id: rest.key }),
      ...(rest.value !== undefined && { value: rest.value }),
    };

    return ctx.api.Setting.Edit({
      Params: { id },
      Body: body as unknown as never,
    });
  },
);
