import * as t from "io-ts";
import { Endpoint } from "ts-endpoint";

import { GetListQuery } from "../io/http/Query/index.js";
import * as Stats from "../io/http/Stats.js";
import { ResourceEndpoints } from "./types.js";

export const List = Endpoint({
  Method: "GET",
  getPath: () => "/stats",
  Input: {
    Query: t.type(
      {
        ...GetListQuery.props,
        type: Stats.StatsType,
        id: t.string,
      },
      "GetStatsListQuery",
    ),
  },
  Output: Stats.OutputList,
});

export const Create = Endpoint({
  Method: "POST",
  getPath: () => "/stats",
  Input: {
    Query: undefined,
    Body: t.unknown,
  },
  Output: Stats.SingleOutput,
});

export const Get = Endpoint({
  Method: "GET",
  getPath: ({ type, id }) => `/stats/${type}/${id}`,
  Input: {
    Query: undefined,
    Params: t.type({
      type: Stats.StatsType,
      id: t.string,
    }),
  },
  Output: Stats.SingleOutput,
});

export const Edit = Endpoint({
  Method: "PUT",
  getPath: ({ id }) => `/stats/${id}`,
  Input: {
    Query: undefined,
    Params: t.type({ id: t.string }),
    Body: t.unknown,
  },
  Output: Stats.SingleOutput,
});

export const Delete = Endpoint({
  Method: "DELETE",
  getPath: ({ id }) => `/stats/${id}`,
  Input: {
    Query: undefined,
    Params: t.type({ id: t.string }),
  },
  Output: Stats.SingleOutput,
});

export const stats = ResourceEndpoints({
  Get,
  Edit,
  List,
  Create,
  Delete,
  Custom: {},
});
