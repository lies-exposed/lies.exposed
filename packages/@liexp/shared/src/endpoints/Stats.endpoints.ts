import * as t from "io-ts";
import { Endpoint } from "ts-endpoint";
import { ListOutput, Output } from "../io/http/Common/Output";
import { GetListQuery } from "../io/http/Query";
import { StatsType } from "../io/http/Stats";
import { ResourceEndpoints } from "./types";

const SingleOutput = Output(t.any, "Stats");
const OutputList = ListOutput(t.any, "StatsList");

export const List = Endpoint({
  Method: "GET",
  getPath: () => "/stats",
  Input: {
    Query: t.type({
      ...GetListQuery.props,
      type: StatsType,
      id: t.string,
    }),
  },
  Output: OutputList,
});

export const Create = Endpoint({
  Method: "POST",
  getPath: () => "/stats",
  Input: {
    Query: undefined,
    Body: t.unknown,
  },
  Output: SingleOutput,
});

export const Get = Endpoint({
  Method: "GET",
  getPath: ({ type, id }) => `/stats/${type}/${id}`,
  Input: {
    Query: undefined,
    Params: t.type({
      type: StatsType,
      id: t.string,
    }),
  },
  Output: SingleOutput,
});

export const Edit = Endpoint({
  Method: "PUT",
  getPath: ({ id }) => `/stats/${id}`,
  Input: {
    Query: undefined,
    Params: t.type({ id: t.string }),
    Body: t.unknown,
  },
  Output: SingleOutput,
});

export const Delete = Endpoint({
  Method: "DELETE",
  getPath: ({ id }) => `/stats/${id}`,
  Input: {
    Query: undefined,
    Params: t.type({ id: t.string }),
  },
  Output: SingleOutput,
});

export const stats = ResourceEndpoints({
  Get,
  Edit,
  List,
  Create,
  Delete,
  Custom: {},
});
