import { type UseQueryResult } from "react-query";
import {
  type InferEndpointInstanceParams,
  type MinimalEndpointInstance,
} from "ts-endpoint";
import { type serializedType } from "ts-io-error/lib/Codec";
import { type APIError } from "../../io/http/Error/APIError";
import {
  type GetListFnParamsE,
  type EndpointsRESTClient,
  type GetDataOutput,
  type GetFnParams,
  type GetListFnQuery,
  type Query,
} from "../EndpointsRESTClient/EndpointsRESTClient";

export type QueryFnKey<P, Q = undefined> = [string, P, Q | undefined, boolean];
export type GetKeyFn<P, Q = undefined> = (
  p: P,
  q?: Q,
  discrete?: boolean,
  prefix?: string,
) => QueryFnKey<P, Q>;

export type QueryPromiseFunction<P, Q, A> = (
  params: P,
  query?: Q,
  discrete?: boolean,
) => Promise<A>;

export interface ResourceQuery<P, Q, A> {
  getKey: GetKeyFn<P, Q>;
  fetch: QueryPromiseFunction<P, Q, A>;
  useQuery: (
    p: P,
    q?: Q,
    discrete?: boolean,
    prefix?: string,
  ) => UseQueryResult<A, APIError>;
}

export interface ResourceQueries<G, L, CC> {
  get: ResourceQuery<GetFnParams<G>, any, GetDataOutput<G>>;
  list: ResourceQuery<GetListFnParamsE<L>, GetListFnQuery<L>, GetDataOutput<L>>;
  Custom: CC extends Record<string, MinimalEndpointInstance>
    ? {
        [K in keyof CC]: ResourceQuery<
          serializedType<
            InferEndpointInstanceParams<CC[K]>["params"]
          > extends never
            ? undefined
            : serializedType<InferEndpointInstanceParams<CC[K]>["params"]>,
          Partial<serializedType<InferEndpointInstanceParams<CC[K]>["query"]>>,
          GetDataOutput<CC[K]>
        >;
      }
    : never;
}

export type ResourceQueryImpl<Q> = Q extends Query<infer G, infer L, infer CC>
  ? ResourceQueries<G, L, CC>
  : never;

export type QueryProvider<ES> = {
  [K in keyof EndpointsRESTClient<ES>]: ResourceQueryImpl<
    EndpointsRESTClient<ES>[K]
  >;
};

export type GetQueryProviderImplAt<
  ES,
  K,
  KK = undefined,
> = K extends keyof QueryProvider<ES>
  ? KK extends keyof QueryProvider<ES>[K]["Custom"]
    ? QueryProvider<ES>[K]["Custom"][KK]
    : QueryProvider<ES>[K]
  : never;
