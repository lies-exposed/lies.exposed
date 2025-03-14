import { Endpoint } from "ts-endpoint";
import { ListOutput } from "../io/http/Common/Output.js";
import { GetListQuery } from "../io/http/Query/index.js";
import * as http from "../io/http/index.js";
import { ResourceEndpoints } from "./types.js";
import { Schema } from 'effect';

const ListProjectImageOutput = ListOutput(
  http.ProjectImage.ProjectImage,
  "ListProjectImage",
);

export const Create = Endpoint({
  Method: "POST",
  getPath: () => `/project/images`,
  Input: {
    Body: Schema.Any,
  },
  Output: ListProjectImageOutput,
});

export const List = Endpoint({
  Method: "GET",
  getPath: () => `/project/images`,
  Input: {
    Query: GetListQuery,
  },
  Output: ListProjectImageOutput,
});

export const Get = Endpoint({
  Method: "GET",
  getPath: ({ id }) => `/project/images/${id}`,
  Input: {
    Params: Schema.Struct({ id: Schema.String }),
  },
  Output: ListProjectImageOutput,
});

export const projectImages = ResourceEndpoints({
  Create,
  List,
  Get,
  Edit: Endpoint({
    Method: "PUT",
    getPath: () => `/articles`,
    Input: {
      Body: Schema.Unknown,
    },
    Output: Schema.Undefined,
  }),
  Delete: Endpoint({
    Method: "DELETE",
    getPath: () => `/articles`,
    Output: Schema.Undefined,
  }),
  Custom: {},
});
