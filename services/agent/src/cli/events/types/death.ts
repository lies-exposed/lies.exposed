import {
  CreateDeathEventSchema,
  EditDeathEventSchema,
} from "@liexp/shared/lib/mcp/schemas/events/death.schema.js";
import { makeCommand } from "../../run-command.js";
import { buildCreateCommon, buildEditCommon } from "./common.js";

export const deathCreate = makeCommand(
  CreateDeathEventSchema,
  {
    usage: "event death create",
    description: "Create a Death event.",
    output: "JSON created event object",
  },
  (input, ctx) =>
    ctx.api.Event.Create({
      Body: {
        ...buildCreateCommon(input),
        type: "Death" as const,
        payload: {
          victim: input.victim,
          location: input.location ?? null,
        },
      } as any,
    }),
);

export const deathEdit = makeCommand(
  EditDeathEventSchema,
  {
    usage: "event death edit",
    description: "Edit a Death event by UUID.",
    output: "JSON updated event object",
  },
  (input, ctx) =>
    ctx.api.Event.Edit({
      Params: { id: input.id },
      Body: {
        ...buildEditCommon(input),
        type: "Death" as const,
        payload: {
          victim: input.victim,
          location: input.location ?? null,
        },
      } as any,
    }),
);
