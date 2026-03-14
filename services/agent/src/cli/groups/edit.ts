import { EditGroupInputSchema } from "@liexp/shared/lib/mcp/schemas/groups.schemas.js";
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
    return ctx.api.Group.Edit({
      Params: { id: input.id },
      Body: {
        ...input,
        startDate: input.startDate?.toISOString(),
        endDate: input.endDate?.toISOString(),
      },
    });
  },
);
