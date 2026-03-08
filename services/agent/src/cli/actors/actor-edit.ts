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
    return ctx.api.Actor.Edit({
      Params: { id: input.id },
      Body: {
        ...(input.username !== undefined ? { username: input.username } : {}),
        ...(input.fullName !== undefined ? { fullName: input.fullName } : {}),
        ...(input.excerpt !== undefined ? { excerpt: input.excerpt } : {}),
        ...(input.body !== undefined ? { body: input.body } : {}),
        ...(input.bornOn !== undefined
          ? { bornOn: new Date(input.bornOn) }
          : {}),
        ...(input.diedOn !== undefined
          ? { diedOn: new Date(input.diedOn) }
          : {}),
        ...(input.avatar !== undefined ? { avatar: input.avatar as any } : {}),
        ...(input.color !== undefined ? { color: input.color as any } : {}),
        ...(input.memberIn !== undefined
          ? { memberIn: input.memberIn as any }
          : {}),
        ...(input.nationalities !== undefined
          ? { nationalities: input.nationalities as any }
          : {}),
      } as any,
    });
  },
);
