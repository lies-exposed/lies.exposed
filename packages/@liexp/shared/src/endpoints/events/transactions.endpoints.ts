import { Endpoint, ResourceEndpoints } from "@ts-endpoint/core";
import { Schema } from "effect";
import { ListOutput, Output } from "../../io/http/Common/Output.js";
import { UUID } from "../../io/http/Common/UUID.js";
import { Events } from "../../io/http/index.js";

const SingleTransactionOutput = Output(
  Events.Transaction.Transaction,
).annotations({
  title: "Transactions",
});
const ListTransactionOutput = ListOutput(
  Events.Transaction.Transaction,
  "Transactions",
);

export const List = Endpoint({
  Method: "GET",
  getPath: () => "/transactions",
  Input: {
    Query: Events.Transaction.TransactionListQuery,
  },
  Output: ListTransactionOutput,
});

export const Get = Endpoint({
  Method: "GET",
  getPath: ({ id }) => `/transactions/${id}`,
  Input: {
    Params: Schema.Struct({ id: UUID }),
  },
  Output: SingleTransactionOutput,
});

export const Create = Endpoint({
  Method: "POST",
  getPath: () => "/transactions",
  Input: {
    Query: undefined,
    Body: Events.Transaction.CreateTransactionBody.omit("type").annotations({
      title: "CreateTransactionBody",
    }),
  },
  Output: SingleTransactionOutput,
});

export const Edit = Endpoint({
  Method: "PUT",
  getPath: ({ id }) => `/transactions/${id}`,
  Input: {
    Params: Schema.Struct({ id: UUID }),
    Body: Events.Transaction.EditTransactionBody.omit("type").annotations({
      title: "EditTransactionBody",
    }),
  },
  Output: SingleTransactionOutput,
});

export const Delete = Endpoint({
  Method: "DELETE",
  getPath: ({ id }) => `/transactions/${id}`,
  Input: {
    Params: Schema.Struct({ id: UUID }),
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
