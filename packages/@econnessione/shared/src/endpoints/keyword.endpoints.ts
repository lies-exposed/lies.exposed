import * as t from "io-ts";
import { Endpoint } from "ts-endpoint";
import { Actor } from "../io/http";
import { ListOutput, Output } from "../io/http/Common/Output";
import { CreateKeyword, Keyword } from "../io/http/Keyword";
import { GetListQuery } from "../io/http/Query";
import { ResourceEndpoints } from "./types";

const SingleKeywordOutput = Output(Keyword, "Keyword");
const ListKeywordOutput = ListOutput(Keyword, "Keywords");

export const List = Endpoint({
  Method: "GET",
  getPath: () => "/keywords",
  Input: {
    Query: t.type({
      ...GetListQuery.props,
      ...Actor.GetListActorQueryFilter.props,
    }),
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
    Body: CreateKeyword,
  },
  Output: SingleKeywordOutput,
});

export const Edit = Endpoint({
  Method: "PUT",
  getPath: ({ id }) => `/keywords/${id}`,
  Input: {
    Params: t.type({ id: t.string }),
    Body: CreateKeyword,
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

export const keywords = ResourceEndpoints({
  Get,
  List,
  Edit,
  Create,
  Delete,
});
