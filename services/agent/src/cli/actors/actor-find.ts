import { FindActorsInputSchema } from "@liexp/shared/lib/mcp/schemas/actors.schemas.js";
import { makeCommand } from "../run-command.js";

export const actorFind = makeCommand(
  FindActorsInputSchema,
  {
    usage: "actor list",
    description: "Search and list actors.",
    output: "JSON list of actor objects",
  },
  (input, ctx) => {
    ctx.logger.debug.log("actor-find input: %O", input);
    return ctx.api.Actor.List({
      Query: {
        q: input.fullName,
        memberIn:
          input.memberIn.length > 0 ? (input.memberIn as any) : undefined,
        _start: input.start !== undefined ? String(input.start) : "0",
        _end: input.end !== undefined ? String(input.end) : "20",
      },
    });
  },
);
