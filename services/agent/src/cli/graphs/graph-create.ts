import { CreateGraphInputSchema } from "@liexp/shared/lib/mcp/schemas/graphs.schemas.js";
import { makeCommand } from "../run-command.js";

export const graphCreate = makeCommand(
  CreateGraphInputSchema,
  {
    usage: "graphs create",
    description: "Create a new graph.",
    output: "JSON created graph object",
  },
  (input, ctx) => {
    ctx.logger.debug.log("graph-create input: %O", input);
    return ctx.api.Graph.Create({
      Body: {
        type: input.type,
        label: input.label,
        slug: input.slug,
        data: input.data,
        options: input.options ?? {},
      },
    });
  },
);
