import { propsOmit } from "@liexp/core/lib/io/utils.js";
import * as t from "io-ts";
import { BySubjectId } from "../Common/BySubject.js";
import { CreateEventCommon, EditEventCommon, EventCommon } from "./BaseEvent.js";
import { TRANSACTION } from "./EventType.js";
import { GetSearchEventsQuery } from "./SearchEvents/SearchEventsQuery.js";

export const TransactionListQuery = t.strict(
  {
    ...propsOmit(GetSearchEventsQuery, ["eventType"]),
  },
  "TransactionListQuery",
);
export type TransactionListQuery = t.TypeOf<typeof TransactionListQuery>;

export const TransactionPayload = t.strict(
  {
    title: t.string,
    total: t.number,
    currency: t.string,
    from: BySubjectId,
    to: BySubjectId,
  },
  "TransactionPayload",
);
export type TransactionPayload = t.TypeOf<typeof TransactionPayload>;

export const CreateTransactionBody = t.strict(
  {
    ...CreateEventCommon.type.props,
    type: TRANSACTION,
    payload: TransactionPayload,
  },
  "CreateTransactionBody",
);

export type CreateTransactionBody = t.TypeOf<typeof CreateTransactionBody>;

export const EditTransactionBody = t.strict(
  {
    ...EditEventCommon.type.props,
    type: TRANSACTION,
    payload: TransactionPayload,
  },
  "EditTransactionBody",
);

export type EditTransactionBody = t.TypeOf<typeof EditTransactionBody>;

export const Transaction = t.strict(
  {
    ...EventCommon.type.props,
    type: TRANSACTION,
    payload: TransactionPayload,
  },
  "TransactionEvent",
);
export type Transaction = t.TypeOf<typeof Transaction>;
