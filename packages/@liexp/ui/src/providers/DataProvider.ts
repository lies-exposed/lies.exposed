/* eslint-disable @typescript-eslint/ban-types */

import { Endpoints } from "@liexp/shared/lib/endpoints";
import { type ResourceEndpoints } from "@liexp/shared/lib/endpoints/types";
import {
  toAPIError,
  type APIError,
} from "@liexp/shared/lib/io/http/Error/APIError";
import type * as io from "@liexp/shared/lib/io/index";
import { throwTE } from '@liexp/shared/lib/utils/task.utils';
import axios from "axios";
import * as A from "fp-ts/Array";
import * as E from "fp-ts/Either";
import * as R from "fp-ts/Record";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import type * as t from "io-ts";
import { PathReporter } from "io-ts/lib/PathReporter";
import type {
  GetListParams,
  GetListResult,
  GetOneResult,
} from "react-admin";
import {
  type EndpointInstance,
  type InferEndpointParams,
  type MinimalEndpoint,
  type MinimalEndpointInstance,
  type TypeOfEndpointInstance,
} from "ts-endpoint";
import { type serializedType } from "ts-io-error/lib/Codec";
import { APIRESTClient } from "../http";

// const httpClient = (
//   url: string,
//   options: fetchUtils.Options = {}
// ): Promise<any> => {
//   if (!options.headers) {
//     options.headers = new Headers({ Accept: "application/json" })
//   }
//   // add your own headers here
//   // options.headers.set('X-Custom-Header', 'foobar');
//   console.log(url)
//   return fetchUtils.fetchJson(url, options)
// }

const toError = (e: unknown): APIError => {
  if ((e as any).name === "AxiosError") {
    return toAPIError((e as any).response.data);
  }
  return toAPIError(e);
};

export const dataProvider = APIRESTClient({
  url: process.env.API_URL ?? "http://localhost:4010/v1",
});

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

export const pageContentByPath = ({
  path,
}: {
  path: string;
}): Promise<io.http.Page.Page> =>
  pipe(
    liftFetch<t.TypeOf<Endpoints["Page"]["List"]["Output"]>>(
      () =>
        dataProvider.getList<io.http.Page.Page>("/pages", {
          filter: { path },
          pagination: { page: 1, perPage: 20 },
          sort: { field: "id", order: "DESC" },
        }),
      Endpoints.Page.List.Output.decode,
    ),
    TE.map((pages) => A.head(pages.data)),
    TE.chain(
      TE.fromOption(
        (): APIError => ({
          name: `APIError`,
          message: `Page ${path} is missing`,
          details: [],
        }),
      ),
    ),
    throwTE,
  );

interface Query<G, L, CC> {
  get: (
    params: InferEndpointParams<G>["params"] extends t.ExactType<infer T>
      ? t.TypeOf<T>
      : InferEndpointParams<G>["params"] extends undefined
        ? undefined
        : serializedType<InferEndpointParams<G>["params"]>,
    query?: serializedType<InferEndpointParams<G>["query"]>,
  ) => Promise<
    InferEndpointParams<G>["output"] extends t.ExactType<infer T>
      ? t.TypeOf<T>["data"]
      : never
  >;
  getList: (
    params: GetListParams,
  ) => Promise<
    InferEndpointParams<L>["output"] extends t.ExactType<infer T>
      ? t.TypeOf<T>
      : never
  >;
  Custom: CC extends Record<string, MinimalEndpointInstance>
    ? {
        [K in keyof CC]: (
          params: (InferEndpointParams<CC[K]>["headers"] extends t.Mixed
            ? { Headers: serializedType<InferEndpointParams<CC[K]>["headers"]> }
            : {}) &
            (InferEndpointParams<CC[K]>["query"] extends t.Mixed
              ? { Query: serializedType<InferEndpointParams<CC[K]>["query"]> }
              : {}) &
            (InferEndpointParams<CC[K]>["params"] extends t.Mixed
              ? { Params: serializedType<InferEndpointParams<CC[K]>["params"]> }
              : {}) &
            (InferEndpointParams<CC[K]>["body"] extends undefined
              ? {}
              : {
                  Body: serializedType<InferEndpointParams<CC[K]>["body"]>;
                }),
        ) => Promise<TypeOfEndpointInstance<CC[K]>["Output"]>;
      }
    : never;
}

type Queries = {
  [K in keyof Endpoints]: Endpoints[K] extends ResourceEndpoints<
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

const toQueries = <
  G extends MinimalEndpoint,
  L extends MinimalEndpoint,
  CC extends Record<string, MinimalEndpointInstance>,
>(
  dataProvider: APIRESTClient,
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
    get: (params, query) =>
      pipe(
        liftFetch(
          () =>
            dataProvider.get<
              serializedType<InferEndpointParams<G>["output"]> & {
                id: string;
              }
            >(e.Get.getPath(params), { ...(params ?? {}), ...(query ?? {}) }),
          e.Get.Output.decode,
        ),
        TE.map((r) => r.data),
        throwTE,
      ),
    getList: (
      params: GetListParams,
    ): Promise<
      InferEndpointParams<L>["output"] extends t.ExactType<infer T>
        ? t.TypeOf<T>
        : never
    > =>
      pipe(
        liftFetch(
          () =>
            dataProvider.getList<{
              id: string;
            }>(e.List.getPath(), params),
          e.List.Output.decode,
        ),
        throwTE,
      ),
    Custom: pipe(
      e.Custom as any,
      R.map((ee: MinimalEndpointInstance) => {
        const fetch = (
          params: TypeOfEndpointInstance<typeof ee>["Input"],
        ): TE.TaskEither<APIError, any> =>
          liftFetch(
            () =>
              dataProvider.request({
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

        return (
          params: TypeOfEndpointInstance<typeof ee>["Input"],
        ): Promise<TypeOfEndpointInstance<typeof ee>["Output"]> =>
          pipe(fetch(params), throwTE);
      }),
    ) as any,
  };
};

const asQueries = (dataProvider: APIRESTClient): Queries =>
  pipe(
    Endpoints,
    R.toArray,
    A.reduce({}, (q, [k, e]) => ({
      ...q,
      [k]: toQueries(dataProvider, e as any),
    })),
  ) as Queries;

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


export { asQueries, type Queries, Endpoints };
