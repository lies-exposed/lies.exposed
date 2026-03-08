import { pipe } from "@liexp/core/lib/fp/index.js";
import { EditActorInputSchema } from "@liexp/shared/lib/mcp/schemas/actors.schemas.js";
import { removeUndefinedFromPayload } from "@liexp/shared/lib/utils/fp.utils.js";
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
    const { id, ...rest } = input;
    return pipe(removeUndefinedFromPayload(rest), (body) =>
      ctx.api.Actor.Edit({ Params: { id }, Body: body as any }),
    );
  },
);
