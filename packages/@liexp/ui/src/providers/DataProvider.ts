import { Endpoints } from "@liexp/shared/endpoints";
import { ResourceEndpoints } from "@liexp/shared/endpoints/types";
import * as io from "@liexp/shared/io/index";
import { APIError } from "@liexp/shared/providers/api.provider";
import { available, queryShallow } from "avenger";
import { CachedQuery, queryStrict } from "avenger/lib/Query";
import axios from "axios";
import * as A from "fp-ts/lib/Array";
import * as E from "fp-ts/lib/Either";
import * as R from "fp-ts/lib/Record";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import * as t from "io-ts";
import { PathReporter } from "io-ts/lib/PathReporter";
import type {
  GetListParams,
  GetListResult,
  GetOneParams,
  GetOneResult
} from "react-admin";
import {
  EndpointInstance,
  InferEndpointParams,
  MinimalEndpoint,
  MinimalEndpointInstance,
  TypeOfEndpointInstance
} from "ts-endpoint";
import { serializedType } from "ts-io-error/lib/Codec";
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
  if (e instanceof Error) {
    return {
      name: "APIError",
      message: e.message,
      details: [],
    };
  }
  return {
    name: "APIError",
    message: "An error occurred",
    details: [],
  };
};

export const dataProvider = APIRESTClient({
  url: process.env.API_URL ?? "http://localhost:4010/v1",
});

const liftFetch = <B extends { data: any }>(
  lp: () => Promise<GetOneResult<any>> | Promise<GetListResult<any>>,
  decode: <A>(a: A) => E.Either<t.Errors, B>
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
          })
        ),
        TE.fromEither
      );
    })
  );
};

export const pageContentByPath = queryStrict<
  { path: string },
  APIError,
  io.http.Page.Page
>(
  ({ path }) =>
    pipe(
      liftFetch<t.TypeOf<Endpoints["Page"]["List"]["Output"]>>(
        () =>
          dataProvider.getList<io.http.Page.Page>("/pages", {
            filter: { path },
            pagination: { page: 1, perPage: 20 },
            sort: { field: "id", order: "DESC" },
          }),
        Endpoints.Page.List.Output.decode
      ),
      TE.map((pages) => A.head(pages.data)),
      TE.chain(
        TE.fromOption(
          (): APIError => ({
            name: `APIError`,
            message: `Page ${path} is missing`,
            details: [],
          })
        )
      )
    ),
  available
);

interface Query<G, L, CC> {
  get: CachedQuery<GetOneParams, APIError, G>;
  getList: CachedQuery<GetListParams, APIError, L>;
  Custom: CC extends { [key: string]: MinimalEndpointInstance }
    ? {
        [K in keyof CC]: CachedQuery<
          (InferEndpointParams<CC[K]>["headers"] extends t.Mixed
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
          APIError,
          TypeOfEndpointInstance<CC[K]>["Output"]
        >;
      }
    : never;
}

type Queries = {
  [K in keyof Endpoints]: Endpoints[K] extends ResourceEndpoints<
    EndpointInstance<infer G>,
    infer L,
    any,
    any,
    any,
    infer CC
  >
    ? Query<
        InferEndpointParams<G>["output"] extends t.ExactType<infer T>
          ? t.TypeOf<T>["data"]
          : never,
        InferEndpointParams<L>["output"] extends t.ExactType<infer T>
          ? t.TypeOf<T>
          : never,
        CC
      >
    : never;
};

const toQueries = <
  G extends MinimalEndpoint,
  L extends MinimalEndpoint,
  CC extends { [key: string]: MinimalEndpointInstance }
>(
  e: ResourceEndpoints<
    EndpointInstance<G>,
    EndpointInstance<L>,
    MinimalEndpointInstance,
    MinimalEndpointInstance,
    MinimalEndpointInstance,
    CC
  >
): Query<
  InferEndpointParams<G>["output"] extends t.ExactType<infer T>
    ? t.TypeOf<T>["data"]
    : never,
  InferEndpointParams<L>["output"] extends t.ExactType<infer T>
    ? t.TypeOf<T>
    : never,
  CC
> => {
  return {
    get: queryShallow<
      GetOneParams,
      APIError,
      InferEndpointParams<G>["output"] extends t.ExactType<infer T>
        ? t.TypeOf<T>["data"]
        : never
    >(
      (params: GetOneParams) =>
        pipe(
          liftFetch(
            () =>
              dataProvider.getOne<
                serializedType<InferEndpointParams<G>["output"]> & {
                  id: string;
                }
              >(e.Get.getPath(params).split("/")[1], params),
            e.Get.Output.decode
          ),
          TE.map((r) => r.data)
        ),
      available
    ),
    getList: queryShallow<
      GetListParams,
      APIError,
      InferEndpointParams<L>["output"] extends t.ExactType<infer T>
        ? t.TypeOf<T>
        : never
    >(
      (params: GetListParams) =>
        liftFetch(
          () =>
            dataProvider.getList<{
              id: string;
            }>(e.List.getPath(), params),
          e.List.Output.decode
        ),
      available
    ),
    Custom: pipe(
      e.Custom as any,
      R.map((e: MinimalEndpointInstance) => {
        const fetch = (
          params: TypeOfEndpointInstance<typeof e>["Input"]
        ): TE.TaskEither<APIError, any> =>
          liftFetch(
            () =>
              dataProvider.request({
                method: e.Method,
                url: e.getPath((params as any).Params),
                params: (params as any).Query,
                data: (params as any).Body,
                responseType: "json",
                headers: {
                  Accept: "application/json",
                  ...(params as any).Headers,
                },
              }),
            e.Output.decode
          );

        return queryShallow<
          TypeOfEndpointInstance<typeof e>["Input"],
          APIError,
          TypeOfEndpointInstance<typeof e>["Output"]
        >(fetch, available);
      })
    ) as any,
  };
};

const Queries: Queries = pipe(
  Endpoints,
  R.toArray,
  A.reduce({}, (q, [k, e]) => ({
    ...q,
    [k]: toQueries(e as any),
  }))
) as Queries;

const jsonClient = axios.create({
  baseURL: `${process.env.DATA_URL}/public`,
});

export const jsonData = <A>(
  decode: t.Decode<unknown, { data: A }>
): CachedQuery<{ id: string }, Error, { data: A }> =>
  queryShallow<{ id: string }, Error, { data: A }>(
    ({ id }: { id: string }) => liftFetch(() => jsonClient.get(id), decode),
    available
  );

export const articleByPath = queryShallow<
  { path: string },
  APIError,
  io.http.Article.Article
>(
  ({ path }) =>
    pipe(
      liftFetch(
        () => dataProvider.get("articles", { path }),
        io.http.Common.ListOutput(io.http.Article.Article, "Articles").decode
      ),
      TE.map((pages) => pages.data[0])
    ),
  available
);

export { Queries, Endpoints };
