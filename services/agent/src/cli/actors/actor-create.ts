import { CreateActorInputSchema } from "@liexp/shared/lib/mcp/schemas/actors.schemas.js";
import { toInitialValue } from "@liexp/shared/lib/providers/blocknote/utils.js";
import { generateRandomColor } from "@liexp/shared/lib/utils/colors.js";
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
    return ctx.api.Actor.Create({
      Body: {
        username: input.username,
        fullName: input.fullName,
        color: input.color ?? generateRandomColor(),
        excerpt: input.excerpt ?? toInitialValue(""),
        nationalities: [...(input.nationalities ?? [])],
        body: input.body,
        avatar: input.avatar,
        bornOn: input.bornOn,
        diedOn: input.diedOn,
      },
    });
  },
);
