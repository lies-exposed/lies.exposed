import { GetAreaInputSchema } from "@liexp/shared/lib/mcp/schemas/areas.schemas.js";
import { makeCommand } from "../run-command.js";

export const areaGet = makeCommand(
  GetAreaInputSchema,
  {
    usage: "area get",
    description: "Retrieve an area by UUID.",
    output: "JSON area object",
  },
  (input, ctx) => {
    ctx.logger.debug.log("area get input: %O", input);
    return ctx.api.Area.Get({ Params: { id: input.id as any } });
  },
);
