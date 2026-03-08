import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { CreateActorInputSchema } from "@liexp/shared/lib/mcp/schemas/actors.schemas.js";
import { stripUndefined } from "../args.js";
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
    return pipe(
      stripUndefined({
        username: input.username,
        fullName: input.fullName,
        color: input.color,
        excerpt: input.excerpt,
        bornOn: input.bornOn ? new Date(input.bornOn) : undefined,
        diedOn: input.diedOn ? new Date(input.diedOn) : undefined,
        avatar: input.avatar,
        nationalityIds: input.nationalityIds,
        body: input.body,
      }),
      (body) => ctx.api.Actor.Create({ Body: body as any }),
      fp.TE.mapLeft((e) => e as Error),
    );
  },
);
