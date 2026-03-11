import { EditActorInputSchema } from "@liexp/shared/lib/mcp/schemas/actors.schemas.js";
import { makeCommand } from "../run-command.js";

export const actorEdit = makeCommand(
  EditActorInputSchema,
  {
    usage: "actor edit",
    description: "Edit an existing actor by UUID.",
    output: "JSON updated actor object",
  },
  (input, ctx) => {
    ctx.logger.debug.log("actor-edit input: %O", input);
    const { id, ...body } = input;
    return ctx.api.Actor.Edit({
      Params: { id },
      Body: {
        ...body,
        bornOn: body.bornOn?.toISOString(),
        diedOn: body.diedOn?.toISOString(),
      },
    });
  },
);
