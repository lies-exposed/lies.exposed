import {
  Area,
  CreateAreaBody,
  EditAreaBody,
  ListAreaQuery,
} from "@liexp/io/lib/http/Area.js";
import { ListOutput, Output } from "@liexp/io/lib/http/Common/Output.js";
import { UUID } from "@liexp/io/lib/http/Common/index.js";
import { Endpoint, ResourceEndpoints } from "@ts-endpoint/core";
import { Schema } from "effect";

const SingleAreaOutput = Output(Area).annotations({
  title: "Area",
});
const ListAreaOutput = ListOutput(Area, "Areas");

const List = Endpoint({
  Method: "GET",
  getPath: () => "/areas",
  Input: {
    Query: ListAreaQuery,
  },
  Output: ListAreaOutput,
});

const Get = Endpoint({
  Method: "GET",
  getPath: ({ id }) => `/areas/${id}`,
  Input: {
    Params: Schema.Struct({ id: UUID }),
  },
  Output: SingleAreaOutput,
});

const Create = Endpoint({
  Method: "POST",
  getPath: () => "/areas",
  Input: {
    Query: undefined,
    Body: CreateAreaBody,
  },
  Output: SingleAreaOutput,
});

export const Edit = Endpoint({
  Method: "PUT",
  getPath: ({ id }) => `/areas/${id}`,
  Input: {
    Params: Schema.Struct({ id: UUID }),
    Body: EditAreaBody,
  },
  Output: SingleAreaOutput,
});

export const Delete = Endpoint({
  Method: "DELETE",
  getPath: ({ id }) => `/areas/${id}`,
  Input: {
    Params: Schema.Struct({ id: UUID }),
  },
  Output: SingleAreaOutput,
});

export const areas = ResourceEndpoints({
  Get,
  Create,
  Edit,
  List,
  Delete,
  Custom: {},
});
