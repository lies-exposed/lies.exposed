import { Schema } from "effect";
import { BySubjectId } from "../Common/BySubject.js";
import {
  CreateEventCommon,
  EditEventCommon,
  EventCommon,
} from "./BaseEvent.js";
import { TRANSACTION } from "./EventType.js";
import { GetSearchEventsQuery } from "./SearchEvents/SearchEventsQuery.js";

export const TransactionListQuery = GetSearchEventsQuery.omit(
  "eventType",
).annotations({
  title: "TransactionListQuery",
});

export type TransactionListQuery = typeof TransactionListQuery.Type;

export const TransactionPayload = Schema.Struct({
  title: Schema.String,
  total: Schema.Number,
  currency: Schema.String,
  from: BySubjectId,
  to: BySubjectId,
}).annotations({
  title: "TransactionPayload",
});
export type TransactionPayload = typeof TransactionPayload.Type;

export const CreateTransactionBody = Schema.Struct({
  ...CreateEventCommon.fields,
  type: TRANSACTION,
  payload: TransactionPayload,
}).annotations({
  title: "CreateTransactionBody",
});

export type CreateTransactionBody = typeof CreateTransactionBody.Type;

export const EditTransactionBody = Schema.Struct({
  ...EditEventCommon.fields,
  type: TRANSACTION,
  payload: TransactionPayload,
}).annotations({
  title: "EditTransactionBody",
});

export type EditTransactionBody = typeof EditTransactionBody.Type;

export const Transaction = Schema.Struct({
  ...EventCommon.fields,
  type: TRANSACTION,
  payload: TransactionPayload,
}).annotations({
  title: "TransactionEvent",
});
export type Transaction = typeof Transaction.Type;
