import { Endpoints } from "@liexp/shared/endpoints";
import { ResourceEndpoints } from "@liexp/shared/endpoints/types";
import * as io from "@liexp/shared/io/index";
import { APIError } from "@liexp/shared/providers/api.provider";
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
  GetOneResult,
} from "react-admin";
import {
  EndpointInstance,
  InferEndpointParams,
  MinimalEndpoint,
  MinimalEndpointInstance,
  TypeOfEndpointInstance,
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

export const foldTE = <E, A>(te: TE.TaskEither<E, A>): Promise<A> => {
  return pipe(
    te,
    TE.fold(
      (e) => () => Promise.reject(e),
      (r) => () => Promise.resolve(r)
    )
  )();
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
    ),
    foldTE
  );

interface Query<G, L, CC> {
  get: (params: GetOneParams) => Promise<G>;
  getList: (params: GetListParams) => Promise<L>;
  Custom: CC extends { [key: string]: MinimalEndpointInstance }
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
                })
        ) => Promise<TypeOfEndpointInstance<CC[K]>["Output"]>;
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
    get: (
      params: GetOneParams
    ): Promise<
      InferEndpointParams<G>["output"] extends t.ExactType<infer T>
        ? t.TypeOf<T>["data"]
        : never
    > =>
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
        TE.map((r) => r.data),
        foldTE
      ),
    getList: (
      params: GetListParams
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
          e.List.Output.decode
        ),
        foldTE
      ),
    Custom: pipe(
      e.Custom as any,
      R.map((ee: MinimalEndpointInstance) => {
        const fetch = (
          params: TypeOfEndpointInstance<typeof ee>["Input"]
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
            ee.Output.decode
          );

        return (
          params: TypeOfEndpointInstance<typeof ee>["Input"]
        ): Promise<TypeOfEndpointInstance<typeof ee>["Output"]> =>
          pipe(fetch(params), foldTE);
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

export const jsonData =
  <A>(decode: t.Decode<unknown, { data: A }>) =>
  ({ id }: { id: string }): Promise<{ data: A }> =>
    pipe(
      liftFetch(() => jsonClient.get(id), decode),
      foldTE
    );

export const articleByPath = ({
  path,
}: {
  path: string;
}): Promise<io.http.Article.Article> =>
  pipe(
    liftFetch(
      () => dataProvider.get("articles", { path }),
      io.http.Common.ListOutput(io.http.Article.Article, "Articles").decode
    ),
    TE.map((pages) => pages.data[0]),
    foldTE
  );

export { Queries, Endpoints };
