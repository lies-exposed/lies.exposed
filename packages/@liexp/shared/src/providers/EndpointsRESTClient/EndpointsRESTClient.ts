import { isAxiosError } from "axios";
import * as A from "fp-ts/lib/Array.js";
import type * as E from "fp-ts/lib/Either.js";
import * as R from "fp-ts/lib/Record.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { pipe } from "fp-ts/lib/function.js";
import type * as t from "io-ts";
// eslint-disable-next-line no-restricted-imports
import type { GetListParams, GetListResult, GetOneResult } from "react-admin";
import {
  type EndpointInstance,
  type InferEndpointInstanceParams,
  type InferEndpointParams,
  type MinimalEndpoint,
  type MinimalEndpointInstance,
  type TypeOfEndpointInstance,
} from "ts-endpoint";
import { type serializedType } from "ts-io-error/lib/Codec.js";
import { type EndpointsMapType } from "../../endpoints/Endpoints.js";
import { type ResourceEndpoints } from "../../endpoints/types.js";
import { toAPIError, type APIError } from "../../io/http/Error/APIError.js";
import { type APIRESTClient } from "../../providers/api-rest.provider.js";
import { fromValidationErrors } from "../../providers/http/http.provider.js";
import { throwTE } from "../../utils/task.utils.js";

const toError = (e: unknown): APIError => {
  if (isAxiosError(e)) {
    return toAPIError(e.response?.data);
  }
  return toAPIError(e);
};

export const dataProviderRequestLift = <B extends { data: any }>(
  lp: () => Promise<GetOneResult<any>> | Promise<GetListResult<any>>,
  decode: <A>(a: A) => E.Either<t.Errors, B>,
): TE.TaskEither<APIError, B> => {
  return pipe(
    TE.tryCatch(lp, toError),
    TE.chain((content) => {
      return pipe(decode(content), fromValidationErrors, TE.fromEither);
    }),
  );
};

export type GetFnParams<G> =
  InferEndpointParams<G>["params"] extends t.ExactType<infer T>
    ? t.TypeOf<T>
    : InferEndpointParams<G>["params"] extends undefined
      ? undefined
      : serializedType<InferEndpointParams<G>["params"]>;

export type GetListFnParamsE<L> = Partial<Omit<GetListParams, "filter">> & {
  filter?: Partial<
    serializedType<
      L extends MinimalEndpointInstance
        ? InferEndpointInstanceParams<L>["query"]
        : InferEndpointParams<L>["query"]
    >
  > | null;
};

export type GetEndpointQueryType<G> =
  InferEndpointParams<G>["query"] extends t.ExactType<infer T>
    ? t.TypeOf<T>
    : InferEndpointParams<G>["query"] extends undefined
      ? undefined
      : serializedType<InferEndpointParams<G>["query"]>;

export type EndpointOutput<L> =
  InferEndpointParams<L>["output"] extends t.ExactType<infer T>
    ? t.TypeOf<T>["data"] extends any[]
      ? t.TypeOf<T>
      : t.TypeOf<T>["data"]
    : never;

export type EndpointDataOutput<L> =
  InferEndpointParams<L>["output"] extends t.ExactType<infer T>
    ? t.TypeOf<T>
    : never;

export type GetDataOutputEI<L> =
  InferEndpointInstanceParams<L>["output"] extends t.ExactType<infer T>
    ? t.TypeOf<T>["data"] extends any[]
      ? t.TypeOf<T>
      : t.TypeOf<T>["data"]
    : never;

export type GetFn<G> = (
  params: GetFnParams<G>,
  query?: Partial<serializedType<InferEndpointParams<G>["query"]>>,
) => Promise<EndpointOutput<G>>;

export type GetListFnParams<L, O = undefined> = O extends undefined
  ? Omit<GetListParams, "filter"> & { filter: Partial<GetEndpointQueryType<L>> }
  : O;

export type GetListFn<L, O = undefined> = (
  params: GetListFnParams<L, O>,
) => Promise<EndpointOutput<L>>;

export interface Query<G, L, CC> {
  get: GetFn<G>;
  getList: GetListFn<L>;
  Custom: CC extends Record<string, MinimalEndpointInstance>
    ? {
        [K in keyof CC]: (
          params: (InferEndpointInstanceParams<CC[K]>["headers"] extends t.Mixed
            ? {
                Headers: serializedType<
                  InferEndpointInstanceParams<CC[K]>["headers"]
                >;
              }
            : Record<string, unknown>) &
            (InferEndpointInstanceParams<CC[K]>["query"] extends t.Mixed
              ? {
                  Query: serializedType<
                    InferEndpointInstanceParams<CC[K]>["query"]
                  >;
                }
              : Record<string, unknown>) &
            (InferEndpointInstanceParams<CC[K]>["params"] extends t.Mixed
              ? {
                  Params: serializedType<
                    InferEndpointInstanceParams<CC[K]>["params"]
                  >;
                }
              : Record<string, unknown>) &
            (InferEndpointInstanceParams<CC[K]>["body"] extends undefined
              ? Record<string, unknown>
              : {
                  Body: serializedType<
                    InferEndpointInstanceParams<CC[K]>["body"]
                  >;
                }),
        ) => Promise<TypeOfEndpointInstance<CC[K]>["Output"]>;
      }
    : never;
}

interface EndpointsRESTClient<ES extends EndpointsMapType> {
  Endpoints: {
    [K in keyof ES]: ES[K] extends ResourceEndpoints<
      EndpointInstance<infer G>,
      EndpointInstance<infer L>,
      any,
      any,
      any,
      infer CC
    >
      ? Query<G, L, CC>
      : never;
  };
  client: APIRESTClient;
}

const restFromResourceEndpoints = <
  G extends MinimalEndpoint,
  L extends MinimalEndpoint,
  CC extends Record<string, MinimalEndpointInstance>,
>(
  apiClient: APIRESTClient,
  e: ResourceEndpoints<
    EndpointInstance<G>,
    EndpointInstance<L>,
    MinimalEndpointInstance,
    MinimalEndpointInstance,
    MinimalEndpointInstance,
    CC
  >,
): Query<G, L, CC> => {
  return {
    get: (params, query) => {
      const url = e.Get.getPath(params);
      return pipe(
        dataProviderRequestLift(
          () =>
            apiClient.get<
              serializedType<InferEndpointParams<G>["output"]> & {
                id: string;
              }
            >(url, { ...(params ?? {}), ...(query ?? {}) }),
          e.Get.Output.decode,
        ),
        TE.map((r) => r.data),
        throwTE,
      );
    },
    getList: (
      params: GetListParams,
    ): Promise<
      InferEndpointParams<L>["output"] extends t.ExactType<infer T>
        ? t.TypeOf<T>
        : never
    > => {
      return pipe(
        dataProviderRequestLift(
          () =>
            apiClient.getList<{
              id: string;
            }>(e.List.getPath(), params),
          e.List.Output.decode,
        ),
        throwTE,
      );
    },
    Custom: pipe(
      e.Custom as any,
      R.map((ee: MinimalEndpointInstance) => {
        const fetch = (
          params: TypeOfEndpointInstance<typeof ee>["Input"],
        ): TE.TaskEither<APIError, any> => {
          const url = ee.getPath((params as any).Params);
          return dataProviderRequestLift(
            () =>
              apiClient.request({
                method: ee.Method,
                url,
                params: (params as any).Query,
                data: (params as any).Body,
                responseType: "json",
                headers: {
                  Accept: "application/json",
                  ...(params as any).Headers,
                },
              }),
            ee.Output.decode,
          );
        };

        return (
          params: TypeOfEndpointInstance<typeof ee>["Input"],
          q: any,
        ): Promise<TypeOfEndpointInstance<typeof ee>["Output"]> => {
          const p: any = params;
          return pipe(
            fetch({
              ...(p?.Params ? { Params: p.Params } : {}),
              Query: {
                ...(p?.Query ?? {}),
                ...(q ?? {}),
              },
            } as any),
            throwTE,
          );
        };
      }),
    ) as any,
  };
};

const fromEndpoints =
  (apiClient: APIRESTClient) =>
  <ES extends EndpointsMapType>(Endpoints: ES): EndpointsRESTClient<ES> => {
    const endpoints = pipe(
      Endpoints,
      R.toArray,
      A.reduce({}, (q, [k, e]) => ({
        ...q,
        [k]: restFromResourceEndpoints(apiClient, e as any),
      })),
    ) as EndpointsRESTClient<ES>["Endpoints"];

    return {
      Endpoints: endpoints,
      client: apiClient,
    };
  };

export { fromEndpoints, type EndpointsRESTClient };
