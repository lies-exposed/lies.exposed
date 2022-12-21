import { propsOmit } from "@liexp/core/io/utils";
import * as t from "io-ts";
import { UUID } from 'io-ts-types/UUID';
import { Endpoint } from "ts-endpoint";
import { Events } from "../../io/http";
import { ListOutput, Output } from "../../io/http/Common/Output";
import { ResourceEndpoints } from "../types";

const SingleQuoteOutput = Output(Events.Quote.Quote, "Quote");
const ListQuotesOutput = ListOutput(Events.Quote.Quote, "Quotes");

export const List = Endpoint({
  Method: "GET",
  getPath: () => "/quotes",
  Input: {
    Query: Events.Quote.QuoteListQuery.type,
  },
  Output: ListQuotesOutput,
});

export const Get = Endpoint({
  Method: "GET",
  getPath: ({ id }) => `/quotes/${id}`,
  Input: {
    Params: t.type({ id: UUID }),
  },
  Output: SingleQuoteOutput,
});

export const Create = Endpoint({
  Method: "POST",
  getPath: () => "/quotes",
  Input: {
    Query: undefined,
    Body: t.strict(
      propsOmit(Events.Quote.CreateQuoteBody, ["type"]),
      "CreateDeathBody"
    ),
  },
  Output: SingleQuoteOutput,
});

export const Edit = Endpoint({
  Method: "PUT",
  getPath: ({ id }) => `/quotes/${id}`,
  Input: {
    Params: t.type({ id: UUID }),
    Body: t.strict(
      propsOmit(Events.Quote.CreateQuoteBody, ["type"]),
      "CreateQuoteBody"
    ),
  },
  Output: SingleQuoteOutput,
});

export const Delete = Endpoint({
  Method: "DELETE",
  getPath: ({ id }) => `/quotes/${id}`,
  Input: {
    Params: t.type({ id: UUID }),
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
