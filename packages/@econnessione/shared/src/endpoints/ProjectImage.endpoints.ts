import * as t from "io-ts";
import { Endpoint } from "ts-endpoint";
import * as http from "../io/http";
import { ListOutput } from "../io/http/Common/Output";
import { GetListQuery } from "../io/http/Query";
import { ResourceEndpoints } from "./types";

const ListProjectImageOutput = ListOutput(
  http.ProjectImage.ProjectImage,
  "ListProjectImage"
);

export const Create = Endpoint({
  Method: "POST",
  getPath: () => `/project/images`,
  Input: {
    Body: t.strict({}),
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
    Params: t.type({ id: t.string }),
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
      Body: t.unknown,
    },
    Output: t.undefined,
  }),
  Delete: Endpoint({
    Method: "DELETE",
    getPath: () => `/articles`,
    Output: t.undefined,
  }),
  Custom: {},
});
