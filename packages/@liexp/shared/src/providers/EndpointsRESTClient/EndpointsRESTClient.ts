import axios from "axios";
import * as A from "fp-ts/Array";
import * as E from "fp-ts/Either";
import * as R from "fp-ts/Record";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import type * as t from "io-ts";
import { PathReporter } from "io-ts/lib/PathReporter";
import type { GetListParams, GetListResult, GetOneResult } from "react-admin";
import {
  type EndpointInstance,
  type InferEndpointInstanceParams,
  type InferEndpointParams,
  type MinimalEndpoint,
  type MinimalEndpointInstance,
  type TypeOfEndpointInstance,
} from "ts-endpoint";
import { type serializedType } from "ts-io-error/lib/Codec";
import { type ResourceEndpoints } from "../../endpoints/types";
import { toAPIError, type APIError } from "../../io/http/Error/APIError";
import { APIRESTClient } from "../../providers/api-rest.provider";
import { throwTE } from "../../utils/task.utils";

const toError = (e: unknown): APIError => {
  if ((e as any).name === "AxiosError") {
    return toAPIError((e as any).response.data);
  }
  return toAPIError(e);
};

const liftFetch = <B extends { data: any }>(
  lp: () => Promise<GetOneResult<any>> | Promise<GetListResult<any>>,
  decode: <A>(a: A) => E.Either<t.Errors, B>,
): TE.TaskEither<APIError, B> => {
  return pipe(
    TE.tryCatch(lp, toError),
    TE.chain((content) => {
      return pipe(
        decode(content),
        E.mapLeft(
          (e): APIError => ({
            name: `APIError`,
            message: `Validation Failed for codec`,
            details: PathReporter.report(E.left(e)),
          }),
        ),
        TE.fromEither,
      );
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
  filter: Partial<
    serializedType<
      L extends MinimalEndpointInstance
        ? InferEndpointInstanceParams<L>["query"]
        : InferEndpointParams<L>["query"]
    >
  > | null;
};

export type GetListFnQuery<G> =
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
  query?: serializedType<InferEndpointParams<G>["query"]>,
) => Promise<EndpointOutput<G>>;

export type GetListFnParams<L, O = undefined> = O extends undefined
  ? Omit<GetListParams, "filter"> & { filter: Partial<GetListFnQuery<L>> }
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

type EndpointsMapType = Record<
  string,
  ResourceEndpoints<
    MinimalEndpointInstance,
    MinimalEndpointInstance,
    MinimalEndpointInstance,
    MinimalEndpointInstance,
    MinimalEndpointInstance,
    Record<string, MinimalEndpointInstance>
  >
>;

type EndpointsRESTClient<ES> = {
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
        liftFetch(
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
        liftFetch(
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
          return liftFetch(
            () =>
              apiClient.request({
                method: ee.Method,
                url: ee.getPath((params as any).Params),
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
          return pipe(fetch(params), throwTE);
        };
      }),
    ) as any,
  };
};

const fromEndpoints =
  (apiClient: APIRESTClient) =>
  <ES extends EndpointsMapType>(Endpoints: ES): EndpointsRESTClient<ES> =>
    pipe(
      Endpoints,
      R.toArray,
      A.reduce({}, (q, [k, e]) => ({
        ...q,
        [k]: restFromResourceEndpoints(apiClient, e as any),
      })),
    ) as EndpointsRESTClient<ES>;

export const apiClient = APIRESTClient({
  url: process.env.API_URL ?? "http://localhost:4010/v1",
});

const jsonClient = axios.create({
  baseURL: `${process.env.DATA_URL}/public`,
});

export const jsonData =
  <A>(decode: t.Decode<unknown, { data: A }>) =>
  ({ id }: { id: string }): Promise<{ data: A }> =>
    pipe(
      liftFetch(() => jsonClient.get(id), decode),
      throwTE,
    );

export { fromEndpoints, type EndpointsRESTClient };
