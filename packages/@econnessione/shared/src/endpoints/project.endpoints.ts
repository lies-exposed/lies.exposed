import * as t from "io-ts";
import { DateFromISOString, optionFromNullable } from "io-ts-types";
import { Endpoint } from "ts-endpoint";
import { nonEmptyRecordFromType } from "../io/Common/NonEmptyRecord";
import * as http from "../io/http";
import { GetListOutput, Output } from "../io/http/Common/Output";
import { CreateAreaBody } from "./area.endpoints";

const SingleGroupOutput = Output(http.Project.Project, "Project");
const ListGroupOutput = GetListOutput(http.Project.Project, "ListProject");

export const List = Endpoint({
  Method: "GET",
  getPath: () => "/projects",
  Input: {
    Query: undefined,
  },
  Output: ListGroupOutput,
});

const CreateBody = t.strict({
  name: t.string,
  color: t.string,
  areas: t.array(CreateAreaBody),
  startDate: DateFromISOString,
  endDate: optionFromNullable(DateFromISOString),
  body: t.string,
});

export const Create = Endpoint({
  Method: "POST",
  getPath: () => "/projects",
  Input: {
    Query: undefined,
    Body: CreateBody,
  },
  Output: SingleGroupOutput,
});

export const Get = Endpoint({
  Method: "GET",
  getPath: ({ id }) => `/projects/${id}`,
  Input: {
    Query: undefined,
    Params: { id: t.string },
  },
  Output: SingleGroupOutput,
});

const EditBody = nonEmptyRecordFromType({
  name: optionFromNullable(t.string),
  color: optionFromNullable(t.string),
  areas: optionFromNullable(t.array(CreateAreaBody)),
  images: optionFromNullable(
    t.array(
      t.strict({
        location: t.string,
        description: t.string,
      })
    )
  ),
  startDate: optionFromNullable(DateFromISOString),
  endDate: optionFromNullable(DateFromISOString),
  body: optionFromNullable(t.string),
});

export const Edit = Endpoint({
  Method: "PUT",
  getPath: ({ id }) => `/projects/${id}`,
  Input: {
    Query: undefined,
    Params: { id: t.string },
    Body: EditBody,
  },
  Output: SingleGroupOutput,
});

export const Delete = Endpoint({
  Method: "DELETE",
  getPath: ({ id }) => `/projects/${id}`,
  Input: {
    Query: undefined,
    Params: { id: t.string },
  },
  Output: SingleGroupOutput,
});
