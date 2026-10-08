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

    // Build partial body - API expects full Setting object but we only have key/value
    const body: Record<string, unknown> = {};

    if (rest.key !== undefined) {
      body.id = rest.key;
    }
    if (rest.value !== undefined) {
      body.value = rest.value;
    }

    return ctx.api.Setting.Edit({
      Params: { id },
      Body: body as any,
    });
  },
);
