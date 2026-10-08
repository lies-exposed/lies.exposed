import { FindGraphsInputSchema } from "@liexp/shared/lib/mcp/schemas/graphs.schemas.js";
import { makeCommand } from "../run-command.js";

export const graphFind = makeCommand(
  FindGraphsInputSchema,
  {
    usage: "graphs list",
    description: "Search and list graphs.",
    output: "JSON list of graph objects",
  },
  (input, ctx) => {
    ctx.logger.debug.log("graph-find input: %O", input);
    return ctx.api.Graph.List({
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
