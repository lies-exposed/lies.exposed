import { EditActorInputSchema } from "@liexp/shared/lib/mcp/schemas/actors.schemas.js";
import { toInitialValue } from "@liexp/shared/lib/providers/blocknote/utils.js";
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
    const { id, excerpt, body, ...rest } = input;
    return ctx.api.Actor.Edit({
      Params: { id },
      Body: removeUndefinedFromPayload({
        username: rest.username,
        fullName: rest.fullName,
        color: rest.color,
        excerpt: excerpt !== undefined ? toInitialValue(excerpt) : undefined,
        body: body !== undefined ? toInitialValue(body) : undefined,
        avatar: rest.avatar,
        bornOn: rest.bornOn,
        diedOn: rest.diedOn,
        nationalities: rest.nationalities as any[] | undefined,
        memberIn: rest.memberIn as any[] | undefined,
      }) as any,
    });
  },
);
