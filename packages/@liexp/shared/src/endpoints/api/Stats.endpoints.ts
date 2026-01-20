import { GetListQuery } from "@liexp/io/lib/http/Query/index.js";
import * as Stats from "@liexp/io/lib/http/Stats.js";
import { Endpoint, ResourceEndpoints } from "@ts-endpoint/core";
import { Schema } from "effect";

export const List = Endpoint({
  Method: "GET",
  getPath: () => "/stats",
  Input: {
    Query: Schema.Struct({
      ...GetListQuery.fields,
      type: Stats.StatsType,
      id: Schema.String,
    }).annotations({
      title: "GetStatsListQuery",
    }),
  },
  Output: Stats.OutputList,
});

export const Create = Endpoint({
  Method: "POST",
  getPath: () => "/stats",
  Input: {
    Query: undefined,
    Body: Schema.Unknown,
  },
  Output: Stats.SingleOutput,
});

export const Get = Endpoint({
  Method: "GET",
  getPath: ({ type, id }) => `/stats/${type}/${id}`,
  Input: {
    Query: undefined,
    Params: Schema.Struct({
      type: Stats.StatsType,
      id: Schema.String,
    }),
  },
  Output: Stats.SingleOutput,
});

export const Edit = Endpoint({
  Method: "PUT",
  getPath: ({ id }) => `/stats/${id}`,
  Input: {
    Query: undefined,
    Params: Schema.Struct({ id: Schema.String }),
    Body: Schema.Unknown,
  },
  Output: Stats.SingleOutput,
});

export const Delete = Endpoint({
  Method: "DELETE",
  getPath: ({ id }) => `/stats/${id}`,
  Input: {
    Query: undefined,
    Params: Schema.Struct({ id: Schema.String }),
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
