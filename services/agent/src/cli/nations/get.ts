import { GetNationInputSchema } from "@liexp/shared/lib/mcp/schemas/nations.schemas.js";
import { makeCommand } from "../run-command.js";

export const nationGet = makeCommand(
  GetNationInputSchema,
  {
    usage: "nation get",
    description: "Retrieve a nation by UUID.",
    output: "JSON nation object",
  },
  (input, ctx) => {
    ctx.logger.debug.log("nation get input: %O", input);
    return ctx.api.Nation.Get({ Params: { id: input.id } });
  },
);
