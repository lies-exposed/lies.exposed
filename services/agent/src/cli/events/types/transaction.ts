import type { EditTransactionBodyPayload } from "@liexp/io/lib/http/Events/Transaction.js";
import {
  CreateTransactionEventSchema,
  EditTransactionEventSchema,
} from "@liexp/shared/lib/mcp/schemas/events/transaction.schema.js";
import { makeCommand } from "../../run-command.js";
import { buildCreateCommon, buildEditCommon } from "./common.js";

export const transactionCreate = makeCommand(
  CreateTransactionEventSchema,
  {
    usage: "event transaction create",
    description: "Create a Transaction event.",
    output: "JSON created event object",
  },
  (input, ctx) =>
    ctx.api.Event.Create({
      Body: {
        ...buildCreateCommon(input),
        type: "Transaction" as const,
        payload: {
          title: input.title,
          total: input.total,
          currency: input.currency,
          from: { type: input.fromType, id: input.fromId },
          to: { type: input.toType, id: input.toId },
        },
        media: [],
        links: [],
        keywords: [],
      },
    }),
);

export const transactionEdit = makeCommand(
  EditTransactionEventSchema,
  {
    usage: "event transaction edit",
    description: "Edit a Transaction event by UUID.",
    output: "JSON updated event object",
  },
  (input, ctx) =>
    ctx.api.Event.Edit({
      Params: { id: input.id },
      Body: {
        ...buildEditCommon(input),
        type: "Transaction" as const,
        payload: {
          title: input.title,
          total: input.total,
          currency: input.currency,
          from:
            input.fromType && input.fromId
              ? { type: input.fromType, id: input.fromId }
              : undefined,
          to:
            input.toType && input.toId
              ? { type: input.toType, id: input.toId }
              : undefined,
        } satisfies EditTransactionBodyPayload,
        media: [],
        links: [],
        keywords: [],
      },
    }),
);
