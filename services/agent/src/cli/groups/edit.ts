import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { EditGroupInputSchema } from "@liexp/shared/lib/mcp/schemas/groups.schemas.js";
import { removeUndefinedFromPayload } from "@liexp/shared/lib/utils/fp.utils.js";
import { makeCommand } from "../run-command.js";

export const groupEdit = makeCommand(
  EditGroupInputSchema,
  {
    usage: "group edit",
    description: "Edit an existing group by UUID.",
    output: "JSON updated group object",
  },
  (input, ctx) => {
    ctx.logger.debug.log("group edit input: %O", input);
    return pipe(
      removeUndefinedFromPayload({
        name: input.name,
        username: input.username,
        kind: input.kind,
        color: input.color,
        excerpt: input.excerpt,
        avatar: input.avatar,
        startDate: input.startDate ? new Date(input.startDate) : undefined,
        endDate: input.endDate ? new Date(input.endDate) : undefined,
        members: input.members,
      }),
      (body) =>
        ctx.api.Group.Edit({ Params: { id: input.id as any }, Body: body as any }),
      fp.TE.mapLeft((e) => e as Error),
    );
  },
);
