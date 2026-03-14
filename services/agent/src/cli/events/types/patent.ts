import type { EditPatentBodyPayload } from "@liexp/io/lib/http/Events/Patent.js";
import {
  CreatePatentEventSchema,
  EditPatentEventSchema,
} from "@liexp/shared/lib/mcp/schemas/events/patent.schema.js";
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
            actors: input.ownerActors ?? [],
            groups: input.ownerGroups ?? [],
          },
          source: input.source!,
        },
      },
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
        payload: {
          title: input.title,
          owners: {
            actors: input.ownerActors ?? [],
            groups: input.ownerGroups ?? [],
          },
          source: input.source,
        } satisfies EditPatentBodyPayload,
      },
    }),
);
