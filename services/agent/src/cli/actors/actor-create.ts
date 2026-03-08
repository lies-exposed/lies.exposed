import { pipe } from "@liexp/core/lib/fp/index.js";
import { CreateActorInputSchema } from "@liexp/shared/lib/mcp/schemas/actors.schemas.js";
import { removeUndefinedFromPayload } from "@liexp/shared/lib/utils/fp.utils.js";
import { makeCommand } from "../run-command.js";

export const actorCreate = makeCommand(
  CreateActorInputSchema,
  {
    usage: "actor create",
    description: "Create a new actor.",
    output: "JSON created actor object",
  },
  (input, ctx) => {
    ctx.logger.debug.log("actor-create input: %O", input);
    return pipe(removeUndefinedFromPayload(input), (body) =>
      ctx.api.Actor.Create({ Body: body as any }),
    );
  },
);
