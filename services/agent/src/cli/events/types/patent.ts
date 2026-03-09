import {
  CreatePatentEventSchema,
  EditPatentEventSchema,
} from "@liexp/shared/lib/mcp/schemas/events/patent.schema.js";
import { removeUndefinedFromPayload } from "@liexp/shared/lib/utils/fp.utils.js";
import { makeCommand } from "../../run-command.js";
import { buildCreateCommon, buildEditCommon } from "./common.js";

export const patentCreate = makeCommand(
  CreatePatentEventSchema,
  {
    usage: "event patent create",
    description: "Create a Patent event.",
    output: "JSON created event object",
  },
  (input, ctx) =>
    ctx.api.Event.Create({
      Body: {
        ...buildCreateCommon(input),
        type: "Patent" as const,
        payload: {
          title: input.title,
          owners: {
            actors: (input.ownerActors ?? []) as any[],
            groups: (input.ownerGroups ?? []) as any[],
          },
          source: input.source,
        },
      } as any,
    }),
);

export const patentEdit = makeCommand(
  EditPatentEventSchema,
  {
    usage: "event patent edit",
    description: "Edit a Patent event by UUID.",
    output: "JSON updated event object",
  },
  (input, ctx) =>
    ctx.api.Event.Edit({
      Params: { id: input.id },
      Body: {
        ...buildEditCommon(input),
        type: "Patent" as const,
        payload: removeUndefinedFromPayload({
          title: input.title,
          owners:
            input.ownerActors !== undefined || input.ownerGroups !== undefined
              ? {
                  actors: (input.ownerActors ?? []) as any[],
                  groups: (input.ownerGroups ?? []) as any[],
                }
              : undefined,
          source: input.source,
        }),
      } as any,
    }),
);
