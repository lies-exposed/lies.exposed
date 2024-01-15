import * as t from "io-ts";
import { Endpoint } from "ts-endpoint";
import {
  Area,
  CreateAreaBody,
  EditAreaBody,
  ListAreaQuery,
} from "../io/http/Area.js";
import { ListOutput, Output } from "../io/http/Common/Output.js";
import { UUID } from "../io/http/Common/index.js";
import { ResourceEndpoints } from "./types.js";

const SingleAreaOutput = Output(Area, "Area");
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
    Params: t.type({ id: UUID }),
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
    Params: t.type({ id: UUID }),
    Body: EditAreaBody,
  },
  Output: SingleAreaOutput,
});

export const Delete = Endpoint({
  Method: "DELETE",
  getPath: ({ id }) => `/areas/${id}`,
  Input: {
    Params: t.type({ id: UUID }),
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
