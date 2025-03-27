import { type UseQueryResult } from "@tanstack/react-query";
import {
  type InferEndpointInstanceParams,
  type MinimalEndpointInstance,
} from "ts-endpoint";
import {
  type PartialSerializedType,
  type RecordCodecEncoded,
} from "ts-io-error/lib/Codec.js";
import { type EndpointsMapType } from "../../endpoints/Endpoints.js";
import { type APIError } from "../../io/http/Error/APIError.js";
import {
  type EndpointOutputType,
  type EndpointDataOutputType,
  type EndpointREST,
  type EndpointsRESTClient,
  type GetEndpointQueryType,
  type GetFnParams,
  type GetListFnParamsE,
} from "../EndpointsRESTClient/types.js";

export type QueryFnKey<P, Q = undefined> = [
  string, //prefix
  P, // params type
  Q | undefined, // query type
  boolean, // discrete - it means it only fetches the data when non empty ids are given
];

export type GetKeyFn<P, Q = undefined> = (
  p: P,
  q?: Q,
  discrete?: boolean,
  prefix?: string,
) => QueryFnKey<P, Q>;

export type QueryPromiseFunction<P, Q = undefined, A = unknown> = (
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
  get: ResourceQuery<
    GetFnParams<G>,
    PartialSerializedType<InferEndpointInstanceParams<G>["query"]>,
    EndpointDataOutputType<G>
  >;
  list: ResourceQuery<
    GetListFnParamsE<L>,
    Partial<GetEndpointQueryType<L>>,
    EndpointOutputType<L>
  >;
  Custom: CC extends Record<string, MinimalEndpointInstance>
    ? {
        [K in keyof CC]: ResourceQuery<
          InferEndpointInstanceParams<CC[K]>["params"] extends undefined
            ? undefined
            : RecordCodecEncoded<InferEndpointInstanceParams<CC[K]>["params"]>,
          PartialSerializedType<InferEndpointInstanceParams<CC[K]>["query"]>,
          EndpointOutputType<CC[K]>
        >;
      }
    : never;
}

export type ResourceQueryImpl<Q> =
  Q extends EndpointREST<infer G, infer L, unknown, unknown, unknown, infer CC>
    ? ResourceQueries<G, L, CC>
    : never;

export type QueryProvider<ES extends EndpointsMapType> = {
  [K in keyof EndpointsRESTClient<ES>["Endpoints"]]: ResourceQueryImpl<
    EndpointsRESTClient<ES>["Endpoints"][K]
  >;
};

export type GetQueryProviderImplAt<
  ES extends EndpointsMapType,
  K,
  KK = undefined,
> = K extends keyof QueryProvider<ES>
  ? KK extends keyof QueryProvider<ES>[K]["Custom"]
    ? QueryProvider<ES>[K]["Custom"][KK]
    : QueryProvider<ES>[K]
  : never;
