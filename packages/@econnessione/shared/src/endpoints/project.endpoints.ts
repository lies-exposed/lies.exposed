import * as t from "io-ts";
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString";
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable";
import { Endpoint } from "ts-endpoint";
import { nonEmptyRecordFromType } from "../io/Common/NonEmptyRecord";
import { ListOutput, Output } from "../io/http/Common/Output";
import * as Project from "../io/http/Project";
import * as ProjectImage from "../io/http/ProjectImage";
import { GetListQuery } from "../io/http/Query";
import { CreateAreaBody } from "./area.endpoints";
import { ResourceEndpoints } from "./types";

const SingleGroupOutput = Output(Project.Project, "Project");
const ListGroupOutput = ListOutput(Project.Project, "ListProject");

const GetProjectListQuery = t.partial(
  {
    ...GetListQuery.props,
  },
  "GetProjectListQuery"
);

export const List = Endpoint({
  Method: "GET",
  getPath: () => "/projects",
  Input: {
    Query: GetProjectListQuery,
  },
  Output: ListGroupOutput,
});

const CreateBody = t.strict({
  name: t.string,
  color: t.string,
  media: t.array(
    t.strict({
      kind: ProjectImage.Kind,
      description: t.string,
      location: t.string,
    })
  ),
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
    Params: t.type({ id: t.string }),
  },
  Output: SingleGroupOutput,
});

const EditBody = nonEmptyRecordFromType({
  name: optionFromNullable(t.string),
  color: optionFromNullable(t.string),
  areas: optionFromNullable(t.array(CreateAreaBody)),
  media: optionFromNullable(
    t.array(
      t.strict({
        kind: ProjectImage.Kind,
        description: t.string,
        location: t.string,
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
    Params: t.type({ id: t.string }),
    Body: EditBody,
  },
  Output: SingleGroupOutput,
});

export const Delete = Endpoint({
  Method: "DELETE",
  getPath: ({ id }) => `/projects/${id}`,
  Input: {
    Params: t.type({ id: t.string }),
  },
  Output: SingleGroupOutput,
});

export const projects = ResourceEndpoints({
  Create,
  Get,
  List,
  Edit,
  Delete,
});
