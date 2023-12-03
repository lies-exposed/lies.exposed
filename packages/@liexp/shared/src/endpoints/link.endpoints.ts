import * as t from "io-ts";
import { Endpoint } from "ts-endpoint";
import { ListOutput, Output, URL, UUID } from "../io/http/Common";
import * as Link from "../io/http/Link";
import { ResourceEndpoints } from "./types";

const OneLinkOutput = Output(Link.Link, "Link");
const ManyLinkOutput = ListOutput(Link.Link, "Links");

export const List = Endpoint({
  Method: "GET",
  getPath: () => "/links",
  Input: {
    Query: Link.GetListLinkQuery,
  },
  Output: ManyLinkOutput,
});

export const Get = Endpoint({
  Method: "GET",
  getPath: ({ id }) => `/links/${id}`,
  Input: {
    Params: t.type({ id: UUID }),
  },
  Output: OneLinkOutput,
});

export const Create = Endpoint({
  Method: "POST",
  getPath: () => "/links",
  Input: {
    Body: Link.CreateLink,
  },
  Output: OneLinkOutput,
});

export const CreateMany = Endpoint({
  Method: "POST",
  getPath: () => "/links/many",
  Input: {
    Body: t.array(Link.CreateLink),
  },
  Output: ManyLinkOutput,
});

export const Submit = Endpoint({
  Method: "POST",
  getPath: () => `/links/submit`,
  Input: {
    Body: t.strict({
      url: URL,
    }),
  },
  Output: OneLinkOutput,
});

export const Edit = Endpoint({
  Method: "PUT",
  getPath: ({ id }) => `/links/${id}`,
  Input: {
    Params: t.type({ id: UUID }),
    Body: Link.EditLink,
  },
  Output: OneLinkOutput,
});

export const Delete = Endpoint({
  Method: "DELETE",
  getPath: ({ id }) => `/links/${id}`,
  Input: {
    Params: t.type({ id: UUID }),
  },
  Output: OneLinkOutput,
});

export const UpdateMetadata = Endpoint({
  Method: "PUT",
  getPath: ({ id }) => `/links/${id}/metadata`,
  Input: {
    Params: t.type({ id: UUID }),
  },
  Output: OneLinkOutput,
});

export const TakeLinkScreenshot = Endpoint({
  Method: "POST",
  getPath: ({ id }) => `/links/${id}/screenshot`,
  Input: {
    Params: t.type({ id: UUID }),
    Body: Link.EditLink,
  },
  Output: OneLinkOutput,
});

export const links = ResourceEndpoints({
  Get,
  List,
  Edit,
  Create,
  Delete,
  Custom: {
    CreateMany,
    Submit,
    TakeLinkScreenshot,
  },
});
