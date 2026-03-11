import { FindGroupsInputSchema } from "@liexp/shared/lib/mcp/schemas/groups.schemas.js";
import { makeCommand } from "../run-command.js";

export const groupList = makeCommand(
  FindGroupsInputSchema,
  {
    usage: "group list",
    description: "Search for groups in the lies.exposed database.",
    output: "JSON group list",
  },
  (input, ctx) => {
    ctx.logger.debug.log("group list input: %O", input);
    return ctx.api.Group.List({
      Query: {
        q: input.query,
        _sort: input.sort,
        _order: input.order,
        _start: input.start !== undefined ? String(input.start) : "0",
        _end: input.end !== undefined ? String(input.end) : "20",
      },
    });
  },
);
