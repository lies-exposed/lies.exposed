import * as t from "io-ts";
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable";
import { Endpoint } from "ts-endpoint";
import { nonEmptyRecordFromType } from "../io/Common/NonEmptyRecord";
import { Area } from "../io/http";
import { Polygon } from "../io/http/Common";
import { ListOutput, Output } from "../io/http/Common/Output";
import { GetListQuery } from "./Query";

const SingleAreaOutput = Output(Area.Area, "Area");
const ListAreaOutput = ListOutput(Area.Area, "Areas");

export const List = Endpoint({
  Method: "GET",
  getPath: () => "/areas",
  Input: {
    Query: {
      ...GetListQuery.props,
    },
  },
  Output: ListAreaOutput,
});

export const Get = Endpoint({
  Method: "GET",
  getPath: ({ id }) => `/areas/${id}`,
  Input: {
    Params: { id: t.string },
  },
  Output: SingleAreaOutput,
});

export const CreateAreaBody = t.strict(
  {
    label: t.string,
    geometry: Polygon,
    body: t.string,
  },
  "CreateAreaBody"
);

export const Create = Endpoint({
  Method: "POST",
  getPath: () => "/areas",
  Input: {
    Query: undefined,
    Body: CreateAreaBody,
  },
  Output: SingleAreaOutput,
});

export const EditAreaBody = nonEmptyRecordFromType({
  geometry: optionFromNullable(Polygon),
  label: optionFromNullable(t.string),
});

export const Edit = Endpoint({
  Method: "PUT",
  getPath: ({ id }) => `/areas/${id}`,
  Input: {
    Params: { id: t.string },
    Body: EditAreaBody,
  },
  Output: SingleAreaOutput,
});

export const Delete = Endpoint({
  Method: "DELETE",
  getPath: ({ id }) => `/areas/${id}`,
  Input: {
    Params: { id: t.string },
  },
  Output: SingleAreaOutput,
});
