import { GetSettingInputSchema } from "@liexp/shared/lib/mcp/schemas/settings.schemas.js";
import { makeCommand } from "../run-command.js";

export const settingGet = makeCommand(
  GetSettingInputSchema,
  {
    usage: "settings get",
    description: "Get a single setting by key.",
    output: "JSON setting object",
  },
  (input, ctx) => {
    ctx.logger.debug.log("setting-get input: %O", input);
    return ctx.api.Setting.Get({ Params: { id: input.id } });
  },
);
