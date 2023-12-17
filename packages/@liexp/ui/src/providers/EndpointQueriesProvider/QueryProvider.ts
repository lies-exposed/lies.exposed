import { fp, pipe } from "@liexp/core/lib/fp";
import * as R from "fp-ts/Record";
import { useQuery } from "react-query";
import {
  type MinimalEndpoint,
  type MinimalEndpointInstance,
} from "ts-endpoint";
import {
  type GetDataOutput,
  type GetFn,
  type GetFnParams,
  type GetListFn,
  type GetListFnParamsE,
  type GetListFnQuery,
  type Query,
} from "../EndpointsRESTClient/EndpointsRESTClient";
import {
  type GetQueryOverride,
  type ResourceEndpointsQueriesOverride,
} from "./QueryProviderOverrides";
import {
  type GetKeyFn,
  type QueryFnKey,
  type QueryPromiseFunction,
  type ResourceQueries,
  type ResourceQuery,
} from "./types";

export const getDefaultKey =
  (key: string) =>
  <P, Q>(p: P, q?: Q, d?: boolean, prefix?: string): QueryFnKey<P, Q> => [
    `${prefix ? `-${prefix}` : ""}${key}`,
    p,
    q ?? undefined,
    d ?? false,
  ];

const toGetResourceQuery = <G>(
  q: GetFn<G>,
  key: string,
  override?: GetQueryOverride<GetFnParams<G>>,
): ResourceQuery<GetFnParams<G>, any, GetDataOutput<G>> => {
  const getKey: GetKeyFn<GetFnParams<G>> =
    override?.getKey ?? getDefaultKey(key);
  const fetch: QueryPromiseFunction<GetFnParams<G>, any, GetDataOutput<G>> = (
    params,
    query,
  ) => {
    return q(params, query);
  };
  return {
    getKey,
    fetch,
    useQuery: (p) =>
      useQuery(getKey(p), ({ queryKey }) => fetch(queryKey[1], queryKey[2])),
  };
};

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
  <P, Q, R>(q: (p: P, q?: Q) => Promise<R>) =>
  async (params: any, query?: any, discrete?: boolean): Promise<R> => {
    if (discrete) {
      if (
        R.isEmpty(params.filter) ||
        (params.filter?.ids && params.filter?.ids?.length === 0)
      ) {
        return await emptyQuery();
      }
    }

    return await q(params, query);
  };

export const toGetListResourceQuery = <L>(
  getListFn: GetListFn<L>,
  key: string,
  override?: GetQueryOverride<GetListFnParamsE<L>, GetListFnQuery<L>>,
): ResourceQuery<GetListFnParamsE<L>, GetListFnQuery<L>, GetDataOutput<L>> => {
  const getKey: GetKeyFn<
    GetListFnParamsE<L>,
    GetListFnQuery<L>
  > = override?.getKey ?? getDefaultKey(key);
  const fetch: QueryPromiseFunction<
    GetListFnParamsE<L>,
    GetListFnQuery<L>,
    GetDataOutput<L>
  > = fetchQuery((p: any, q: any) => getListFn(p));
  return {
    getKey,
    fetch,
    useQuery: (p) =>
      useQuery(getKey(p), ({ queryKey }) =>
        fetch(queryKey[1], queryKey[2], !!queryKey[3]),
      ),
  };
};

export const toQueries = <
  ES,
  G extends MinimalEndpoint,
  L extends MinimalEndpoint,
  CC extends Record<string, MinimalEndpointInstance>,
>(
  key: string,
  e: Query<G, L, CC>,
  override?: ResourceEndpointsQueriesOverride<ES, G, L, CC>,
): ResourceQueries<G, L, CC> => {
  return {
    get: toGetResourceQuery(e.get, key, override?.get),
    list: toGetListResourceQuery(e.getList, key, override?.list),
    Custom: pipe(
      e.Custom,
      fp.R.mapWithIndex((index, ee) => {
        const getKey = getDefaultKey(`${key}-${index}`);
        const fetch = fetchQuery<any, any, any>((p, q) => {
          return ee({ Params: p, Query: q } as any);
        });

        return {
          getKey,
          fetch,
          useQuery: (p: any) =>
            useQuery(getKey(p), ({ queryKey }) =>
              fetch(queryKey[1], queryKey[2], !!queryKey[3]),
            ),
        };
      }),
    ) as any,
  };
};
