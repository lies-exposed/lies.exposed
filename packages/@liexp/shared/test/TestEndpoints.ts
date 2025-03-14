import { Endpoint } from "ts-endpoint";
import { ResourceEndpoints } from "../src/endpoints/types.js";
import {
    type CustomQueryOverride,
  type QueryProviderOverrides,
  type ResourceEndpointsQueriesOverride,
} from "../src/providers/EndpointQueriesProvider/QueryProviderOverrides.js";
import { Schema } from 'effect';

const Actor = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  avatar: Schema.Struct({
    id: Schema.String,
    url: Schema.String,
    createdAt: Schema.DateFromString,
    updatedAt: Schema.DateFromString,
  }).annotations({ title: "Avatar" }),
  bornOn: Schema.Union(Schema.Null, Schema.DateFromString),
  diedOn: Schema.Union(Schema.Null, Schema.DateFromString),
  createdAt: Schema.DateFromString,
  updatedAt: Schema.DateFromString,
}).annotations({ title: "Actor" });

const TestEndpoints = {
  Actor: ResourceEndpoints({
    Get: Endpoint({
      Method: "GET",
      getPath: ({ id }) => `/actors/${id}`,
      Input: { Params: Schema.Struct({ id: Schema.String }), Query: undefined },
      Output: Schema.Struct({ data: Actor }),
    }),
    List: Endpoint({
      Method: "GET",
      getPath: () => `/actors`,
      Input: {
        Query: t.partial({
          _start: Schema.Number,
          _end: Schema.Number,
          ids: Schema.Array(Schema.String),
        }),
      },
      Output: Schema.Struct({ data: Schema.Array(Actor), total: Schema.Number }),
    }),
    Create: Endpoint({
      Method: "POST",
      getPath: () => `/actors`,
      Input: { Body: Actor },
      Output: Schema.Struct({ data: Actor }),
    }),
    Edit: Endpoint({
      Method: "PUT",
      getPath: ({ id }) => `/actors/${id}`,
      Input: {
        Params: Schema.Struct({ id: Schema.String }),
        Body: Actor,
      },
      Output: Schema.Struct({ data: Actor }),
    }),
    Delete: Endpoint({
      Method: "DELETE",
      getPath: ({ id }) => `/actors/${id}`,
      Input: { Params: Schema.Struct({ id: Schema.String }) },
      Output: Schema.Boolean,
    }),
    Custom: {
      GetSiblings: Endpoint({
        Method: "GET",
        getPath: ({ id }) => `/actors/${id}/siblings`,
        Input: { Params: Schema.Struct({ id: Schema.String }) },
        Output: Schema.Struct({ data: Schema.Array(Actor) }),
      }),
    },
  }),
};
type TestEndpoints = typeof TestEndpoints;

const GetSiblingsOverride: CustomQueryOverride<
  TestEndpoints,
  { id: string },
  undefined,
  any
> =
  (Q) =>
  ({ id }) => {
    return Q.Actor.getList({
      pagination: { perPage: 10, page: 1 },
      filter: { ids: [id] },
      sort: {
        field: "createdAt",
        order: "ASC",
      },
    });
  };

const ActorOverride: ResourceEndpointsQueriesOverride<
  TestEndpoints,
  any,
  any,
  {
    GetSiblingsOverride: typeof GetSiblingsOverride;
  }
> = {
  Custom: {
    GetSiblingsOverride,
  },
};

export const overrides: QueryProviderOverrides<
  TestEndpoints,
  { Actor: typeof ActorOverride }
> = {
  Actor: ActorOverride,
};


export { TestEndpoints }