import { GetGraphInputSchema } from "@liexp/shared/lib/mcp/schemas/graphs.schemas.js";
import { makeCommand } from "../run-command.js";

export const graphGet = makeCommand(
  GetGraphInputSchema,
  {
    usage: "graphs get",
    description: "Get a single graph by UUID.",
    output: "JSON graph object",
  },
  (input, ctx) => {
    ctx.logger.debug.log("graph-get input: %O", input);
    return ctx.api.Graph.Get({ Params: { id: input.id } });
  },
);
