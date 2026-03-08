import { fp, pipe } from "@liexp/core/lib/fp/index.js";
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
    return pipe(
      removeUndefinedFromPayload({
        username: input.username,
        fullName: input.fullName,
        excerpt: input.excerpt,
        body: input.body,
        bornOn: input.bornOn ? new Date(input.bornOn) : undefined,
        diedOn: input.diedOn ? new Date(input.diedOn) : undefined,
        avatar: input.avatar,
        color: input.color,
        memberIn: input.memberIn,
        nationalities: input.nationalities,
      }),
      (body) =>
        ctx.api.Actor.Edit({ Params: { id: input.id }, Body: body as any }),
      fp.TE.mapLeft((e) => e as Error),
    );
  },
);
