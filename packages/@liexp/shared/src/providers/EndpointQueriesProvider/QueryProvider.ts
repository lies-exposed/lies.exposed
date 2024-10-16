import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { GetLogger } from "@liexp/core/lib/logger/index.js";
import { useQuery } from "@tanstack/react-query";
import * as R from "fp-ts/lib/Record.js";
import { type TaskEither } from "fp-ts/lib/TaskEither.js";
import {
  type InferEndpointParams,
  type MinimalEndpoint,
  type MinimalEndpointInstance,
} from "ts-endpoint";
import { type serializedType } from "ts-io-error/lib/Codec.js";
import { type EndpointsMapType } from "../../endpoints/Endpoints.js";
import { type APIError } from "../../io/http/Error/APIError.js";
import { throwTE } from "../../utils/task.utils.js";
import {
  type EndpointOutput,
  type GetFn,
  type GetFnParams,
  type GetListFn,
  type GetListFnParamsE,
  type GetEndpointQueryType,
  type EndpointREST,
} from "../EndpointsRESTClient/types.js";
import {
  type GetQueryOverride,
  type ResourceEndpointsQueriesOverride,
} from "./QueryProviderOverrides.js";
import {
  type GetKeyFn,
  type QueryFnKey,
  type QueryPromiseFunction,
  type ResourceQueries,
  type ResourceQuery,
} from "./types.js";

const queryProviderLogger = GetLogger("QueryProvider");

export const getDefaultKey =
  (key: string) =>
  <P, Q>(p: P, q?: Q, d?: boolean, prefix?: string): QueryFnKey<P, Q> => [
    `${prefix ? `${prefix}-` : ""}${key}`,
    p,
    q ?? undefined,
    d ?? false,
  ];

export const emptyQuery = (): Promise<any> =>
  Promise.resolve({
    data: [],
    total: 0,
  });

export type FetchQuery<FN extends (...args: any[]) => Promise<any>> =
  FN extends (p: infer P, q: infer Q, discrete: infer D) => Promise<infer O>
    ? (p: P, q?: Q, discrete?: boolean) => Promise<O>
    : never;

export const fetchQuery =
  <P, Q, R>(q: (p: P, q?: Q) => TaskEither<APIError, R>) =>
  async (params: any, query?: any, discrete?: boolean): Promise<R> => {
    if (discrete) {
      if (
        R.isEmpty(params.filter) ||
        (params.filter?.ids && params.filter?.ids.length === 0)
      ) {
        return emptyQuery();
      }
    }

    return pipe(q(params, query), throwTE);
  };

const toGetResourceQuery = <G>(
  getFn: GetFn<G>,
  key: string,
  override?: GetQueryOverride<
    GetFnParams<G>,
    Partial<serializedType<InferEndpointParams<G>["query"]>>
  >,
): ResourceQuery<
  GetFnParams<G>,
  Partial<serializedType<InferEndpointParams<G>["query"]>>,
  EndpointOutput<G>
> => {
  const getKey: GetKeyFn<
    GetFnParams<G>,
    Partial<serializedType<InferEndpointParams<G>["query"]>>
  > = override?.getKey ?? getDefaultKey(key);
  const fetch: QueryPromiseFunction<
    GetFnParams<G>,
    Partial<serializedType<InferEndpointParams<G>["query"]>>,
    EndpointOutput<G>
  > = (params, query) => {
    return pipe(getFn(params, query), throwTE);
  };
  return {
    getKey,
    fetch,
    useQuery: (p, q, d, prefix) => {
      const qKey = getKey(p, q, d, prefix);
      queryProviderLogger.debug.log("useQuery for %s 'get' %O", key, qKey);
      return useQuery({
        queryKey: qKey,
        queryFn: ({ queryKey }) =>
          fetch(queryKey[1], queryKey[2], !!queryKey[3]),
      });
    },
  };
};

export const toGetListResourceQuery = <L>(
  getListFn: GetListFn<L>,
  key: string,
  override?: GetQueryOverride<
    GetListFnParamsE<L>,
    Partial<GetEndpointQueryType<L>>
  >,
): ResourceQuery<
  GetListFnParamsE<L>,
  Partial<GetEndpointQueryType<L>>,
  EndpointOutput<L>
> => {
  const getKey: GetKeyFn<
    GetListFnParamsE<L>,
    Partial<GetEndpointQueryType<L>>
  > = override?.getKey ?? getDefaultKey(key);

  const fetch: QueryPromiseFunction<
    GetListFnParamsE<L>,
    Partial<GetEndpointQueryType<L>>,
    EndpointOutput<L>
  > = fetchQuery((p: any, q: any) => getListFn(p));
  return {
    getKey,
    fetch,
    useQuery: (p, q, d, prefix) => {
      const qKey = getKey(p, q, d, prefix);
      queryProviderLogger.debug.log("useQuery for %s 'list' %O", key, qKey);
      return useQuery({
        queryKey: qKey,
        queryFn: ({ queryKey }) =>
          fetch(queryKey[1], queryKey[2], !!queryKey[3]),
      });
    },
  };
};

export const toQueries = <
  ES extends EndpointsMapType,
  G extends MinimalEndpoint,
  L extends MinimalEndpoint,
  C extends MinimalEndpoint,
  E extends MinimalEndpoint,
  D extends MinimalEndpoint,
  CC extends Record<string, MinimalEndpointInstance>,
>(
  key: string,
  e: EndpointREST<G, L, C, E, D, CC>,
  override?: ResourceEndpointsQueriesOverride<ES, G, L, CC>,
): ResourceQueries<G, L, CC> => {
  return {
    get: toGetResourceQuery(e.get, key, override?.get),
    list: toGetListResourceQuery(e.getList, key, override?.list),
    Custom: pipe(
      e.Custom,
      fp.Rec.mapWithIndex((index, ee) => {
        const getKey = getDefaultKey(`${key}-${index}`);
        const fetch = fetchQuery<any, any, any>((p, q) => {
          return ee({ Params: p, Query: q } as any, q);
        });

        return {
          getKey,
          fetch,
          useQuery: (p: any, q: any, d: any, prefix: any) => {
            const qKey = getKey(p, q, d, prefix);
            queryProviderLogger.debug.log(
              "useQuery for %s 'Custom' %s: %O",
              key,
              index,
              qKey,
            );
            return useQuery({
              queryKey: qKey,
              queryFn: ({ queryKey }) =>
                fetch(queryKey[1], queryKey[2], !!queryKey[3]),
            });
          },
        };
      }),
    ) as any,
  };
};
