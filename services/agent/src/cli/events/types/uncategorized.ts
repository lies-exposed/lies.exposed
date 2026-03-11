import {
  CreateUncategorizedEventSchema,
  EditUncategorizedEventSchema,
} from "@liexp/shared/lib/mcp/schemas/events/uncategorized.schema.js";
import { removeUndefinedFromPayload } from "@liexp/shared/lib/utils/fp.utils.js";
import { makeCommand } from "../../run-command.js";
import { buildCreateCommon, buildEditCommon } from "./common.js";

export const uncategorizedCreate = makeCommand(
  CreateUncategorizedEventSchema,
  {
    usage: "event uncategorized create",
    description: "Create an Uncategorized event.",
    output: "JSON created event object",
  },
  (input, ctx) =>
    ctx.api.Event.Create({
      Body: {
        ...buildCreateCommon(input),
        type: "Uncategorized" as const,
        payload: {
          title: input.title,
          actors: [...(input.actors ?? [])],
          groups: [...(input.groups ?? [])],
          groupsMembers: [...(input.groupsMembers ?? [])],
          location: input.location ?? null,
          endDate: input.endDate ?? null,
        },
      } as any,
    }),
);

export const uncategorizedEdit = makeCommand(
  EditUncategorizedEventSchema,
  {
    usage: "event uncategorized edit",
    description: "Edit an Uncategorized event by UUID.",
    output: "JSON updated event object",
  },
  (input, ctx) =>
    ctx.api.Event.Edit({
      Params: { id: input.id },
      Body: {
        ...buildEditCommon(input),
        type: "Uncategorized" as const,
        payload: removeUndefinedFromPayload({
          title: input.title,
          actors: input.actors ? [...input.actors] : undefined,
          groups: input.groups ? [...input.groups] : undefined,
          groupsMembers: input.groupsMembers
            ? [...input.groupsMembers]
            : undefined,
          location: input.location ?? null,
          endDate: input.endDate ?? null,
        }),
      } as any,
    }),
);
