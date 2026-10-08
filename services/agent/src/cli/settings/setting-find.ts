import { FindSettingsInputSchema } from "@liexp/shared/lib/mcp/schemas/settings.schemas.js";
import { makeCommand } from "../run-command.js";

export const settingFind = makeCommand(
  FindSettingsInputSchema,
  {
    usage: "settings list",
    description: "Search and list settings.",
    output: "JSON list of setting objects",
  },
  (input, ctx) => {
    ctx.logger.debug.log("setting-find input: %O", input);
    return ctx.api.Setting.List({
      Query: {
        q: input.q,
        _start: input.start !== undefined ? String(input.start) : "0",
        _end: input.end !== undefined ? String(input.end) : "20",
        _sort: input.sort,
        _order: input.order,
      },
    });
  },
);
