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
    const { id, ...rest } = input;
    return pipe(
      removeUndefinedFromPayload(rest),
      (body) =>
        ctx.api.Group.Edit({ Params: { id: id as any }, Body: body as any }),
      fp.TE.mapLeft((e) => e as Error),
    );
  },
);
