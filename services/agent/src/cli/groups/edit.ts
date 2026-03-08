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
      Params: { id: input.id as any },
      Body: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.username !== undefined ? { username: input.username } : {}),
        ...(input.kind !== undefined ? { kind: input.kind } : {}),
        ...(input.color !== undefined ? { color: input.color as any } : {}),
        ...(input.excerpt !== undefined
          ? { excerpt: input.excerpt as any }
          : {}),
        ...(input.avatar !== undefined ? { avatar: input.avatar as any } : {}),
        ...(input.startDate !== undefined
          ? { startDate: new Date(input.startDate) }
          : {}),
        ...(input.endDate !== undefined
          ? { endDate: new Date(input.endDate) }
          : {}),
        ...(input.members !== undefined
          ? { members: input.members as any }
          : {}),
      } as any,
    });
  },
);
