import {
  CreateQuoteEventSchema,
  EditQuoteEventSchema,
} from "@liexp/shared/lib/mcp/schemas/events/quote.schema.js";
import { makeCommand } from "../../run-command.js";
import { buildCreateCommon, buildEditCommon } from "./common.js";

export const quoteCreate = makeCommand(
  CreateQuoteEventSchema,
  {
    usage: "event quote create",
    description: "Create a Quote event.",
    output: "JSON created event object",
  },
  (input, ctx) =>
    ctx.api.Event.Create({
      Body: {
        ...buildCreateCommon(input),
        type: "Quote" as const,
        payload: {
          actor: input.actor,
          subject: undefined,
          quote: input.quote,
          details: input.details,
        },
      } as any,
    }),
);

export const quoteEdit = makeCommand(
  EditQuoteEventSchema,
  {
    usage: "event quote edit",
    description: "Edit a Quote event by UUID.",
    output: "JSON updated event object",
  },
  (input, ctx) =>
    ctx.api.Event.Edit({
      Params: { id: input.id },
      Body: {
        ...buildEditCommon(input),
        type: "Quote" as const,
        payload: {
          actor: input.actor,
          subject: undefined,
          quote: input.quote,
          details: input.details,
        },
      } as any,
    }),
);
