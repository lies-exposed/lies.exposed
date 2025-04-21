import { Endpoint, ResourceEndpoints } from "@ts-endpoint/core";
import { Schema } from "effect";
import { ListOutput, Output } from "../../io/http/Common/Output.js";
import { UUID } from "../../io/http/Common/UUID.js";
import { Events } from "../../io/http/index.js";

const SingleQuoteOutput = Output(Events.Quote.Quote).annotations({
  title: "Quote",
});
const ListQuotesOutput = ListOutput(Events.Quote.Quote, "Quotes");

export const List = Endpoint({
  Method: "GET",
  getPath: () => "/quotes",
  Input: {
    Query: Events.Quote.QuoteListQuery,
  },
  Output: ListQuotesOutput,
});

export const Get = Endpoint({
  Method: "GET",
  getPath: ({ id }) => `/quotes/${id}`,
  Input: {
    Params: Schema.Struct({ id: UUID }),
  },
  Output: SingleQuoteOutput,
});

export const Create = Endpoint({
  Method: "POST",
  getPath: () => "/quotes",
  Input: {
    Query: undefined,
    Body: Events.Quote.CreateQuoteBody.omit("type").annotations({
      title: "CreateQuoteBody",
    }),
  },
  Output: SingleQuoteOutput,
});

export const Edit = Endpoint({
  Method: "PUT",
  getPath: ({ id }) => `/quotes/${id}`,
  Input: {
    Params: Schema.Struct({ id: UUID }),
    Body: Events.Quote.CreateQuoteBody.omit("type").annotations({
      title: "CreateQuoteBody",
    }),
  },
  Output: SingleQuoteOutput,
});

export const Delete = Endpoint({
  Method: "DELETE",
  getPath: ({ id }) => `/quotes/${id}`,
  Input: {
    Params: Schema.Struct({ id: UUID }),
  },
  Output: SingleQuoteOutput,
});

export const quotes = ResourceEndpoints({
  Create,
  Edit,
  List,
  Get,
  Delete,
  Custom: {},
});
