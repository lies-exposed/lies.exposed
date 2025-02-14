import * as t from "io-ts";
import { Endpoint } from "ts-endpoint";
import { ResourceEndpoints } from "../src/endpoints/types.js";
import {
    type CustomQueryOverride,
  type QueryProviderOverrides,
  type ResourceEndpointsQueriesOverride,
} from "../src/providers/EndpointQueriesProvider/QueryProviderOverrides.js";
import { DateFromISOString } from 'io-ts-types';

const Actor = t.strict({
  id: t.string,
  name: t.string,
  avatar: t.strict({
    id: t.string,
    url: t.string,
    createdAt: DateFromISOString,
    updatedAt: DateFromISOString,
  }, 'Avatar'),
  bornOn: t.union([t.null, DateFromISOString]),
  diedOn: t.union([t.null, DateFromISOString]),
  createdAt: DateFromISOString,
  updatedAt: DateFromISOString,
}, 'Actor');

const TestEndpoints = {
  Actor: ResourceEndpoints({
    Get: Endpoint({
      Method: "GET",
      getPath: ({ id }) => `/actors/${id}`,
      Input: { Params: t.type({ id: t.string }), Query: undefined },
      Output: t.strict({ data: Actor }),
    }),
    List: Endpoint({
      Method: "GET",
      getPath: () => `/actors`,
      Input: {
        Query: t.partial({
          _start: t.number,
          _end: t.number,
          ids: t.array(t.string),
        }),
      },
      Output: t.strict({ data: t.array(Actor), total: t.number }),
    }),
    Create: Endpoint({
      Method: "POST",
      getPath: () => `/actors`,
      Input: { Body: Actor },
      Output: t.strict({ data: Actor }),
    }),
    Edit: Endpoint({
      Method: "PUT",
      getPath: ({ id }) => `/actors/${id}`,
      Input: {
        Params: t.type({ id: t.string }),
        Body: Actor,
      },
      Output: t.strict({ data: Actor }),
    }),
    Delete: Endpoint({
      Method: "DELETE",
      getPath: ({ id }) => `/actors/${id}`,
      Input: { Params: t.type({ id: t.string }) },
      Output: t.boolean,
    }),
    Custom: {
      GetSiblings: Endpoint({
        Method: "GET",
        getPath: ({ id }) => `/actors/${id}/siblings`,
        Input: { Params: t.type({ id: t.string }) },
        Output: t.strict({ data: t.array(Actor) }),
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