import { GetActorInputSchema } from "@liexp/shared/lib/mcp/schemas/actors.schemas.js";
import { makeCommand } from "../run-command.js";

export const actorGet = makeCommand(
  GetActorInputSchema,
  {
    usage: "actor get",
    description: "Get a single actor by UUID.",
    output: "JSON actor object",
  },
  (input, ctx) => {
    ctx.logger.debug.log("actor-get input: %O", input);
    return ctx.api.Actor.Get({ Params: { id: input.id } });
  },
);
