import * as t from "io-ts";
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable";
import { Endpoint } from "ts-endpoint";
import { URL } from "../io/Common";
import { ListOutput, Output, UUID } from "../io/http/Common";
import { Link } from "../io/http/Link";
import { GetListQuery } from "../io/http/Query";
import { ResourceEndpoints } from "./types";

const SingleActorOutput = Output(Link, "Link");
const ListActorOutput = ListOutput(Link, "Links");

export const List = Endpoint({
  Method: "GET",
  getPath: () => "/links",
  Input: {
    Query: t.type({
      ...GetListQuery.props,
      events: optionFromNullable(t.array(UUID)),
    }),
  },
  Output: ListActorOutput,
});

export const Get = Endpoint({
  Method: "GET",
  getPath: ({ id }) => `/links/${id}`,
  Input: {
    Params: t.type({ id: t.string }),
  },
  Output: SingleActorOutput,
});

export const Create = Endpoint({
  Method: "POST",
  getPath: () => "/links",
  Input: {
    Body: t.strict(
      {
        url: URL,
        events: t.array(t.string),
      },
      "CreateLinkBody"
    ),
  },
  Output: SingleActorOutput,
});

export const Edit = Endpoint({
  Method: "PUT",
  getPath: ({ id }) => `/links/${id}`,
  Input: {
    Params: t.type({ id: t.string }),
    Body: t.strict(
      {
        title: t.string,
        url: URL,
        description: t.string,
        keywords: t.array(t.string),
        provider: t.string,
        events: t.array(t.string),
      },
      "EditLinkBody"
    ),
  },
  Output: SingleActorOutput,
});

export const Delete = Endpoint({
  Method: "DELETE",
  getPath: ({ id }) => `/links/${id}`,
  Input: {
    Params: t.type({ id: t.string }),
  },
  Output: SingleActorOutput,
});

export const links = ResourceEndpoints({
  Get,
  List,
  Edit,
  Create,
  Delete,
});
