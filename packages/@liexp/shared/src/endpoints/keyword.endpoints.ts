import * as t from "io-ts";
import { Endpoint } from "ts-endpoint";
import { UUID } from "../io/http/Common";
import * as Keyword from "../io/http/Keyword";
import { ResourceEndpoints } from "./types";

export const List = Endpoint({
  Method: "GET",
  getPath: () => "/keywords",
  Input: {
    Query: Keyword.GetKeywordListQuery,
  },
  Output: Keyword.ListKeywordOutput,
});

export const Get = Endpoint({
  Method: "GET",
  getPath: ({ id }) => `/keywords/${id}`,
  Input: {
    Params: t.type({ id: UUID }),
  },
  Output: Keyword.SingleKeywordOutput,
});

export const Create = Endpoint({
  Method: "POST",
  getPath: () => "/keywords",
  Input: {
    Body: Keyword.CreateKeyword,
  },
  Output: Keyword.SingleKeywordOutput,
});

export const Edit = Endpoint({
  Method: "PUT",
  getPath: ({ id }) => `/keywords/${id}`,
  Input: {
    Params: t.type({ id: UUID }),
    Body: Keyword.CreateKeyword,
  },
  Output: Keyword.SingleKeywordOutput,
});

export const Delete = Endpoint({
  Method: "DELETE",
  getPath: ({ id }) => `/keywords/${id}`,
  Input: {
    Params: t.type({ id: UUID }),
  },
  Output: Keyword.SingleKeywordOutput,
});

export const Distribution = Endpoint({
  Method: "GET",
  getPath: () => "/keywords/distribution",
  Input: {
    Query: Keyword.GetKeywordListQuery,
  },
  Output: t.strict({
    data: t.any,
    total: t.number,
  }),
});

export const keywords = ResourceEndpoints({
  Get,
  List,
  Edit,
  Create,
  Delete,
  Custom: {
    Distribution,
  },
});
