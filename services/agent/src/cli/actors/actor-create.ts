import { CreateActorInputSchema } from "@liexp/shared/lib/mcp/schemas/actors.schemas.js";
import { makeCommand } from "../run-command.js";

export const actorCreate = makeCommand(
  CreateActorInputSchema,
  { usage: "actor create", description: "Create a new actor.", output: "JSON created actor object" },
  (input, ctx) => {
    ctx.logger.debug.log("actor-create input: %O", input);
    return ctx.api.Actor.Create({
      Body: {
        username: input.username,
        fullName: input.fullName,
        ...(input.color !== undefined ? { color: input.color as any } : {}),
        ...(input.excerpt !== undefined ? { excerpt: input.excerpt } : {}),
        ...(input.bornOn !== undefined ? { bornOn: new Date(input.bornOn) } : {}),
        ...(input.diedOn !== undefined ? { diedOn: new Date(input.diedOn) } : {}),
        ...(input.avatar !== undefined ? { avatar: input.avatar as any } : {}),
        ...(input.nationalityIds !== undefined ? { nationalityIds: input.nationalityIds as any } : {}),
        ...(input.body !== undefined ? { body: input.body } : {}),
      } as any,
    });
  },
);
