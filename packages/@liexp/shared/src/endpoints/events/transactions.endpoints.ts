import { propsOmit } from "@liexp/core/lib/io/utils.js";
import * as t from "io-ts";
import { UUID } from "io-ts-types/lib/UUID.js";
import { Endpoint } from "ts-endpoint";
import { ListOutput, Output } from "../../io/http/Common/Output.js";
import { Events } from "../../io/http/index.js";
import { ResourceEndpoints } from "../types.js";

const SingleTransactionOutput = Output(
  Events.Transaction.Transaction,
  "Transactions",
);
const ListTransactionOutput = ListOutput(
  Events.Transaction.Transaction,
  "Transactions",
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
    Params: t.type({ id: UUID }),
  },
  Output: SingleTransactionOutput,
});

export const Create = Endpoint({
  Method: "POST",
  getPath: () => "/transactions",
  Input: {
    Query: undefined,
    Body: t.strict(
      propsOmit(Events.Transaction.CreateTransactionBody, ["type"]),
      "CreateTransactionBody",
    ),
  },
  Output: SingleTransactionOutput,
});

export const Edit = Endpoint({
  Method: "PUT",
  getPath: ({ id }) => `/transactions/${id}`,
  Input: {
    Params: t.type({ id: UUID }),
    Body: t.strict(
      propsOmit(Events.Transaction.EditTransactionBody, ["type"]),
      "EditTransactionBody",
    ),
  },
  Output: SingleTransactionOutput,
});

export const Delete = Endpoint({
  Method: "DELETE",
  getPath: ({ id }) => `/transactions/${id}`,
  Input: {
    Params: t.type({ id: UUID }),
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
