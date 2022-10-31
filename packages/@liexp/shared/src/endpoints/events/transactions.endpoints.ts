import { propsOmit } from "@liexp/core/io/utils";
import * as t from "io-ts";
import { Endpoint } from "ts-endpoint";
import { Events } from "../../io/http";
import { ListOutput, Output } from "../../io/http/Common/Output";
import { ResourceEndpoints } from "../types";

const SingleTransactionOutput = Output(
  Events.Transaction.Transaction,
  "Transactions"
);
const ListTransactionOutput = ListOutput(
  Events.Transaction.Transaction,
  "Transactions"
);

export const List = Endpoint({
  Method: "GET",
  getPath: () => "/transactions",
  Input: {
    Query: Events.Transaction.TransactionListQuery.type,
  },
  Output: ListTransactionOutput,
});

export const Get = Endpoint({
  Method: "GET",
  getPath: ({ id }) => `/transactions/${id}`,
  Input: {
    Params: t.type({ id: t.string }),
  },
  Output: SingleTransactionOutput,
});

export const Create = Endpoint({
  Method: "POST",
  getPath: () => "/transactions",
  Input: {
    Query: undefined,
    Body: t.strict(
      propsOmit(Events.Transaction.CreateTransactionBody, [
        "type",
      ]),
      "CreateTransactionBody"
    ),
  },
  Output: SingleTransactionOutput,
});

export const Edit = Endpoint({
  Method: "PUT",
  getPath: ({ id }) => `/transactions/${id}`,
  Input: {
    Params: t.type({ id: t.string }),
    Body: t.strict(
      propsOmit(Events.Transaction.EditTransactionBody, ["type"]),
      "EditTransactionBody"
    ),
  },
  Output: SingleTransactionOutput,
});

export const Delete = Endpoint({
  Method: "DELETE",
  getPath: ({ id }) => `/transactions/${id}`,
  Input: {
    Params: t.type({ id: t.string }),
  },
  Output: SingleTransactionOutput,
});

export const transactions = ResourceEndpoints({
  Create,
  Edit,
  List,
  Get,
  Delete,
  Custom: {},
});
