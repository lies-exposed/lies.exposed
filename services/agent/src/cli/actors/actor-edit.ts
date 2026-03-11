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
    return ctx.api.Actor.Edit({
      Params: { id },
      Body: removeUndefinedFromPayload({
        username: rest.username,
        fullName: rest.fullName,
        color: rest.color,
        excerpt: rest.excerpt,
        body: rest.body,
        avatar: rest.avatar,
        bornOn: rest.bornOn,
        diedOn: rest.diedOn,
        nationalities: rest.nationalities,
        memberIn: rest.memberIn,
      }) as any,
    });
  },
);
