import { Schema } from "effect";
import { Endpoint } from "ts-endpoint";
import { nonEmptyRecordFromType } from "../io/Common/NonEmptyRecord.js";
import { CreateAreaBody } from "../io/http/Area.js";
import { OptionFromNullishToNull } from "../io/http/Common/OptionFromNullishToNull.js";
import { ListOutput, Output } from "../io/http/Common/Output.js";
import * as Project from "../io/http/Project.js";
import * as ProjectImage from "../io/http/ProjectImage.js";
import { GetListQuery } from "../io/http/Query/index.js";
import { ResourceEndpoints } from "./types.js";

const SingleGroupOutput = Output(Project.Project).annotations({
  title: "Project",
});
const ListGroupOutput = ListOutput(Project.Project, "ListProject");

const GetProjectListQuery = GetListQuery.annotations({
  title: "GetProjectListQuery",
});

export const List = Endpoint({
  Method: "GET",
  getPath: () => "/projects",
  Input: {
    Query: GetProjectListQuery,
  },
  Output: ListGroupOutput,
});

const CreateBody = Schema.Struct({
  name: Schema.String,
  color: Schema.String,
  media: Schema.Array(
    Schema.Struct({
      kind: ProjectImage.Kind,
      description: Schema.String,
      location: Schema.String,
    }),
  ),
  areas: Schema.Array(CreateAreaBody),
  startDate: Schema.DateFromString,
  endDate: OptionFromNullishToNull(Schema.DateFromString),
  body: Schema.String,
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
    Params: Schema.Struct({ id: Schema.String }),
  },
  Output: SingleGroupOutput,
});

const EditBody = nonEmptyRecordFromType({
  name: OptionFromNullishToNull(Schema.String),
  color: OptionFromNullishToNull(Schema.String),
  areas: OptionFromNullishToNull(Schema.Array(CreateAreaBody)),
  media: OptionFromNullishToNull(
    Schema.Array(
      Schema.Struct({
        kind: ProjectImage.Kind,
        description: Schema.String,
        location: Schema.String,
      }),
    ),
  ),
  startDate: OptionFromNullishToNull(Schema.DateFromString),
  endDate: OptionFromNullishToNull(Schema.DateFromString),
  body: OptionFromNullishToNull(Schema.String),
});

export const Edit = Endpoint({
  Method: "PUT",
  getPath: ({ id }) => `/projects/${id}`,
  Input: {
    Params: Schema.Struct({ id: Schema.String }),
    Body: EditBody,
  },
  Output: SingleGroupOutput,
});

export const Delete = Endpoint({
  Method: "DELETE",
  getPath: ({ id }) => `/projects/${id}`,
  Input: {
    Params: Schema.Struct({ id: Schema.String }),
  },
  Output: SingleGroupOutput,
});

export const projects = ResourceEndpoints({
  Create,
  Get,
  List,
  Edit,
  Delete,
  Custom: {},
});
