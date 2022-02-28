import * as t from "io-ts";
import { Endpoint } from "ts-endpoint";
import { Keyword } from "../io/http";
import { ListOutput, Output } from "../io/http/Common/Output";
import { ResourceEndpoints } from "./types";

const SingleKeywordOutput = Output(Keyword.Keyword, "Keyword");
const ListKeywordOutput = ListOutput(Keyword.Keyword, "Keywords");

export const List = Endpoint({
  Method: "GET",
  getPath: () => "/keywords",
  Input: {
    Query: Keyword.ListQuery,
  },
  Output: ListKeywordOutput,
});

export const Get = Endpoint({
  Method: "GET",
  getPath: ({ id }) => `/keywords/${id}`,
  Input: {
    Params: t.type({ id: t.string }),
  },
  Output: SingleKeywordOutput,
});

export const Create = Endpoint({
  Method: "POST",
  getPath: () => "/keywords",
  Input: {
    Body: Keyword.CreateKeyword,
  },
  Output: SingleKeywordOutput,
});

export const Edit = Endpoint({
  Method: "PUT",
  getPath: ({ id }) => `/keywords/${id}`,
  Input: {
    Params: t.type({ id: t.string }),
    Body: Keyword.CreateKeyword,
  },
  Output: SingleKeywordOutput,
});

export const Delete = Endpoint({
  Method: "DELETE",
  getPath: ({ id }) => `/keywords/${id}`,
  Input: {
    Params: t.type({ id: t.string }),
  },
  Output: SingleKeywordOutput,
});

export const Distribution = Endpoint({
  Method: "GET",
  getPath: () => "/keywords/distribution",
  Input: {
    Query: Keyword.ListQuery,
  },
  Output: t.strict({
    data: t.any,
    total: t.number
  }),
});


export const keywords = ResourceEndpoints({
  Get,
  List,
  Edit,
  Create,
  Delete,
  Custom: {
    Distribution
  },
});
