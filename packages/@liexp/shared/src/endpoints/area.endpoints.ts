import * as t from "io-ts";
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable";
import { Endpoint } from "ts-endpoint";
import { Area } from "../io/http/Area";
import { UUID } from "../io/http/Common";
import { Geometry } from "../io/http/Common/Geometry";
import { ListOutput, Output } from "../io/http/Common/Output";
import { GetListQuery } from "../io/http/Query";
import { ResourceEndpoints } from "./types";

const SingleAreaOutput = Output(Area, "Area");
const ListAreaOutput = ListOutput(Area, "Areas");

const List = Endpoint({
  Method: "GET",
  getPath: () => "/areas",
  Input: {
    Query: t.type({
      ...GetListQuery.props,
      q: optionFromNullable(t.string),
      ids: optionFromNullable(t.array(UUID)),
    }),
  },
  Output: ListAreaOutput,
});

const Get = Endpoint({
  Method: "GET",
  getPath: ({ id }) => `/areas/${id}`,
  Input: {
    Params: t.type({ id: t.string }),
  },
  Output: SingleAreaOutput,
});

export const CreateAreaBody = t.strict(
  {
    label: t.string,
    geometry: Geometry,
    body: t.UnknownRecord,
  },
  "CreateAreaBody"
);

const Create = Endpoint({
  Method: "POST",
  getPath: () => "/areas",
  Input: {
    Query: undefined,
    Body: CreateAreaBody,
  },
  Output: SingleAreaOutput,
});

export const EditAreaBody = t.strict(
  {
    geometry: optionFromNullable(Geometry),
    label: optionFromNullable(t.string),
    body: optionFromNullable(t.UnknownRecord),
    media: t.array(UUID),
    events: t.array(UUID),
  },
  "EditAreaBody"
);

export const Edit = Endpoint({
  Method: "PUT",
  getPath: ({ id }) => `/areas/${id}`,
  Input: {
    Params: t.type({ id: t.string }),
    Body: EditAreaBody,
  },
  Output: SingleAreaOutput,
});

export const Delete = Endpoint({
  Method: "DELETE",
  getPath: ({ id }) => `/areas/${id}`,
  Input: {
    Params: t.type({ id: t.string }),
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
