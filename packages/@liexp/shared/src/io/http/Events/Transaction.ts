import { propsOmit } from "@liexp/core/io/utils";
import * as t from "io-ts";
import { BySubject } from "../Common/BySubject";
import { CreateEventCommon, EditEventCommon, EventCommon } from "./BaseEvent";
import { GetSearchEventsQuery } from "./SearchEventsQuery";

export const TRANSACTION = t.literal("Transaction");
export type TRANSACTION = t.TypeOf<typeof TRANSACTION>;

export const TransactionListQuery = t.strict(
  {
    ...propsOmit(GetSearchEventsQuery, ["type"]),
  },
  "TransactionListQuery"
);
export type TransactionListQuery = t.TypeOf<typeof TransactionListQuery>;

export const TransactionPayload = t.strict(
  {
    title: t.string,
    total: t.number,
    currency: t.string,
    from: BySubject,
    to: BySubject,
  },
  "TransactionPayload"
);
export type TransactionPayload = t.TypeOf<typeof TransactionPayload>;

export const CreateTransactionBody = t.strict(
  {
    ...CreateEventCommon.type.props,
    type: TRANSACTION,
    payload: TransactionPayload,
  },
  "CreateTransactionBody"
);

export type CreateTransactionBody = t.TypeOf<typeof CreateTransactionBody>;

export const EditTransactionBody = t.strict(
  {
    ...EditEventCommon.type.props,
    type: TRANSACTION,
    payload: TransactionPayload,
  },
  "EditTransactionBody"
);

export type EditTransactionBody = t.TypeOf<typeof EditTransactionBody>;

export const Transaction = t.strict(
  {
    ...EventCommon.type.props,
    type: TRANSACTION,
    payload: TransactionPayload,
  },
  "TransactionEvent"
);
export type Transaction = t.TypeOf<typeof Transaction>;
