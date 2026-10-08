import { CreateSettingInputSchema } from "@liexp/shared/lib/mcp/schemas/settings.schemas.js";
import { makeCommand } from "../run-command.js";

export const settingCreate = makeCommand(
  CreateSettingInputSchema,
  {
    usage: "settings create",
    description: "Create a new setting.",
    output: "JSON created setting object",
  },
  (input, ctx) => {
    ctx.logger.debug.log("setting-create input: %O", input);
    return ctx.api.Setting.Create({
      Body: {
        id: input.key,
        value: input.value,
      },
    });
  },
);
