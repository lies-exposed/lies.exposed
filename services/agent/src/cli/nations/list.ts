import { FindNationsInputSchema } from "@liexp/shared/lib/mcp/schemas/nations.schemas.js";
import { makeCommand } from "../run-command.js";

export const nationList = makeCommand(
  FindNationsInputSchema,
  {
    usage: "nation list",
    description: "Search and list nations.",
    output: "JSON list of nation objects",
  },
  (input, ctx) => {
    ctx.logger.debug.log("nation list input: %O", input);
    return ctx.api.Nation.List({
      Query: {
        q: input.name,
        _start: input.start !== undefined ? String(input.start) : "0",
        _end: input.end !== undefined ? String(input.end) : "20",
      } as any,
    });
  },
);
