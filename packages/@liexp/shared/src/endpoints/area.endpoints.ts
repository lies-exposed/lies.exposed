import { Endpoint, ResourceEndpoints } from "@ts-endpoint/core";
import { Schema } from "effect";
import {
  Area,
  CreateAreaBody,
  EditAreaBody,
  ListAreaQuery,
} from "../io/http/Area.js";
import { ListOutput, Output } from "../io/http/Common/Output.js";
import { UUID } from "../io/http/Common/index.js";

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
