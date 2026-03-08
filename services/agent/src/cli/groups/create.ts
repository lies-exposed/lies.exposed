import { CreateGroupInputSchema } from "@liexp/shared/lib/mcp/schemas/groups.schemas.js";
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
        name: input.name,
        username: input.username,
        kind: input.kind,
        color: input.color as any,
        excerpt: input.excerpt as any,
        avatar: input.avatar as any,
        startDate: input.startDate ? new Date(input.startDate) : undefined,
        endDate: input.endDate ? new Date(input.endDate) : undefined,
        members: [],
      },
    });
  },
);
