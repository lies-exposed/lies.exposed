import { BySubjectId } from "@liexp/shared/lib/io/http/Common/BySubject.js";
import { TRANSACTION } from "@liexp/shared/lib/io/http/Events/EventType.js";
import { type CreateTransactionBody } from "@liexp/shared/lib/io/http/Events/Transaction.js";
import { Schema } from "effect";
import { pipe } from "fp-ts/lib/function.js";
import { createEvent } from "../../../../flows/events/createEvent.flow.js";
import {
  baseEventSchema,
  transformBaseCreateEventFields,
  wrapEventFlowTask,
} from "./eventHelpers.js";

export const CreateTransactionEventInputSchema = Schema.Struct({
  ...baseEventSchema.fields,
  title: Schema.String.annotations({
    description: "Title/description of the transaction",
  }),
  total: Schema.Number.annotations({
    description: "Total amount of the transaction",
  }),
  currency: Schema.String.annotations({
    description: "Currency code (e.g., USD, EUR, BTC)",
  }),
  from: BySubjectId.annotations({
    description: "The entity sending/paying in the transaction",
  }),
  to: BySubjectId.annotations({
    description: "The entity receiving/being paid in the transaction",
  }),
});
export type CreateTransactionEventInputSchema =
  typeof CreateTransactionEventInputSchema.Type;

export const createTransactionEventToolTask = ({
  date,
  draft,
  excerpt,
  body,
  media,
  links,
  keywords,
  title,
  total,
  currency,
  from,
  to,
}: CreateTransactionEventInputSchema) => {
  const eventBody: CreateTransactionBody = {
    ...transformBaseCreateEventFields({
      date,
      draft,
      excerpt,
      body,
      media,
      links,
      keywords,
    }),
    type: TRANSACTION.literals[0],
    payload: {
      title,
      total,
      currency,
      from,
      to,
    },
  };

  return pipe(createEvent(eventBody), (flow) =>
    wrapEventFlowTask(flow, "Created transaction"),
  );
};
