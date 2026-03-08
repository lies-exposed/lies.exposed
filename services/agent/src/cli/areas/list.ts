import { FindAreasInputSchema } from "@liexp/shared/lib/mcp/schemas/areas.schemas.js";
import { makeCommand } from "../run-command.js";

export const areaList = makeCommand(
  FindAreasInputSchema,
  { usage: "area list", description: "Search and list geographic areas.", output: "JSON list of area objects" },
  (input, ctx) => {
    ctx.logger.debug.log("area list input: %O", input);
    return ctx.api.Area.List({
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
