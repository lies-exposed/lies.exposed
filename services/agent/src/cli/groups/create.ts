import { CreateGroupInputSchema } from "@liexp/shared/lib/mcp/schemas/groups.schemas.js";
import { toInitialValue } from "@liexp/shared/lib/providers/blocknote/utils.js";
import { generateRandomColor } from "@liexp/shared/lib/utils/colors.js";
import { makeCommand } from "../run-command.js";

export const groupCreate = makeCommand(
  CreateGroupInputSchema,
  {
    usage: "group create",
    description: "Create a new group.",
    output: "JSON created group object",
  },
  (input, ctx) => {
    ctx.logger.debug.log("group create input: %O", input);
    return ctx.api.Group.Create({
      Body: {
        ...input,
        color: input.color ?? generateRandomColor(),
        excerpt: input.excerpt ?? toInitialValue(input.name),
        avatar: input.avatar,
        startDate: input.startDate?.toISOString(),
        endDate: input.endDate?.toISOString(),
        members: [],
      },
    });
  },
);
