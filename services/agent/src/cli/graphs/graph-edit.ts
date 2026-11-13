import { type CreateGraphData } from "@liexp/io/lib/http/graphs/Graph.js";
import { EditGraphInputSchema } from "@liexp/shared/lib/mcp/schemas/graphs.schemas.js";
import { makeCommand } from "../run-command.js";

export const graphEdit = makeCommand(
  EditGraphInputSchema,
  {
    usage: "graphs edit",
    description: "Edit an existing graph by UUID.",
    output: "JSON updated graph object",
  },
  (input, ctx) => {
    ctx.logger.debug.log("graph-edit input: %O", input);
    const { id, ...rest } = input;

    // Build body - API expects full CreateGraphData but we allow partial updates
    const body = { ...rest } as Record<string, unknown>;

    // Default options to empty object if not provided
    if (body.options === undefined) {
      body.options = {};
    }

    return ctx.api.Graph.Edit({
      Params: { id },
      Body: body as unknown as CreateGraphData,
    });
  },
);
