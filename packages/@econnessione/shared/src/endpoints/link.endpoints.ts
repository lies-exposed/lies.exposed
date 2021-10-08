import * as t from "io-ts";
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable";
import { Endpoint } from "ts-endpoint";
import { ListOutput, Output, UUID } from "../io/http/Common";
import { URL } from "../io/http/Common/URL";
import { Link } from "../io/http/Link";
import { GetListQuery } from "../io/http/Query";
import { ResourceEndpoints } from "./types";

const OneLinkOutput = Output(Link, "Link");
const ManyLinkOutput = ListOutput(Link, "Links");

export const List = Endpoint({
  Method: "GET",
  getPath: () => "/links",
  Input: {
    Query: t.type({
      ...GetListQuery.props,
      events: optionFromNullable(t.array(UUID)),
    }),
  },
  Output: ManyLinkOutput,
});

export const Get = Endpoint({
  Method: "GET",
  getPath: ({ id }) => `/links/${id}`,
  Input: {
    Params: t.type({ id: t.string }),
  },
  Output: OneLinkOutput,
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
  Output: OneLinkOutput,
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
  Output: OneLinkOutput,
});

export const Delete = Endpoint({
  Method: "DELETE",
  getPath: ({ id }) => `/links/${id}`,
  Input: {
    Params: t.type({ id: t.string }),
  },
  Output: OneLinkOutput,
});

export const UpdateMetadata = Endpoint({
  Method: "PUT",
  getPath: ({ id }) => `/links/${id}/metadata`,
  Input: {
    Params: t.type({ id: t.string }),
  },
  Output: OneLinkOutput,
});

export const links = ResourceEndpoints({
  Get,
  List,
  Edit,
  Create,
  Delete,
});
