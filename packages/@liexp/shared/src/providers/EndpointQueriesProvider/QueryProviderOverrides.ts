import { fp } from "@liexp/core/lib/fp/index.js";
import { useQuery } from "@tanstack/react-query";
import { type TaskEither } from "fp-ts/lib/TaskEither.js";
import { pipe } from "fp-ts/lib/function.js";
import {
  type InferEndpointParams,
  type MinimalEndpoint,
  type MinimalEndpointInstance,
} from "ts-endpoint";
import { type serializedType } from "ts-io-error/lib/Codec.js";
import { type EndpointsMapType } from "../../endpoints/Endpoints.js";
import { type APIError } from "../../io/http/Error/APIError.js";
import {
  type EndpointsRESTClient,
  type GetFnParams,
  type GetEndpointQueryType,
  type GetListFnParamsE,
} from "../EndpointsRESTClient/types.js";
import { fetchQuery, getDefaultKey } from "./QueryProvider.js";
import { type GetKeyFn, type ResourceQueries } from "./types.js";

export interface GetQueryOverride<P, Q = undefined> {
  getKey?: GetKeyFn<P, Q>;
  // transformParams?: (p: any) => any;
  // transformResult?: (r: any) => any;
}

export type CustomQueryOverride<ES extends EndpointsMapType, P, Q, O> = (
  q: EndpointsRESTClient<ES>["Endpoints"],
) => (p: P, q: Q) => TaskEither<APIError, O>;

export interface ResourceEndpointsQueriesOverride<
  ES extends EndpointsMapType,
  G,
  L,
  CC,
> {
  get?: G extends MinimalEndpointInstance
    ? GetQueryOverride<
        GetFnParams<G>,
        Partial<serializedType<InferEndpointParams<G>["query"]>>
      >
    : never;
  list?: L extends MinimalEndpointInstance
    ? GetQueryOverride<GetListFnParamsE<L>, Partial<GetEndpointQueryType<L>>>
    : never;
  Custom?: {
    [K in keyof CC]: CC[K] extends CustomQueryOverride<
      ES,
      infer P,
      infer Q,
      infer O
    >
      ? CustomQueryOverride<ES, P, Q, O>
      : never;
  };
}

export type QueryProviderOverrides<
  ES extends EndpointsMapType,
  QO = Record<string, any>,
> = {
  [K in keyof QO]: QO[K] extends ResourceEndpointsQueriesOverride<
    ES,
    infer G,
    infer L,
    infer CC
  >
    ? ResourceEndpointsQueriesOverride<ES, G, L, CC>
    : never;
};

export const toOverrideQueries = <
  ES extends EndpointsMapType,
  G extends MinimalEndpoint,
  L extends MinimalEndpoint,
  CC extends Record<string, any>,
>(
  QP: EndpointsRESTClient<ES>["Endpoints"],
  namespace: string,
  e: ResourceEndpointsQueriesOverride<ES, G, L, CC>,
): Partial<ResourceQueries<G, L, CC>> => {
  return {
    // get: undefined,
    // list: undefined,
    Custom: pipe(
      e.Custom ?? {},
      fp.Rec.mapWithIndex((key, ee) => {
        const getKey = getDefaultKey(`${namespace}-${key}`);
        const fetch = fetchQuery((p, q) => {
          return (ee as any)(QP)(p, q);
        });

        return {
          getKey,
          fetch,
          useQuery: (p: any) =>
            useQuery({
              queryKey: getKey(p),
              queryFn: ({ queryKey }) => {
                return fetch(queryKey[1], queryKey[2], !!queryKey[3]);
              },
            }),
        };
      }),
    ) as any,
  };
};
