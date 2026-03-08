import { GetGroupInputSchema } from "@liexp/shared/lib/mcp/schemas/groups.schemas.js";
import { makeCommand } from "../run-command.js";

export const groupGet = makeCommand(
  GetGroupInputSchema,
  { usage: "group get", description: "Retrieve a group by UUID.", output: "JSON group object" },
  (input, ctx) => {
    ctx.logger.debug.log("group get input: %O", input);
    return ctx.api.Group.Get({ Params: { id: input.id as any } });
  },
);
