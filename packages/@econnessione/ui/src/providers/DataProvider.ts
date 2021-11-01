import { Endpoints } from "@econnessione/shared/endpoints";
import { ResourceEndpoints } from "@econnessione/shared/endpoints/types";
import * as io from "@econnessione/shared/io/index";
import { available, queryShallow } from "avenger";
import { CachedQuery, queryStrict } from "avenger/lib/Query";
import axios from "axios";
import * as A from "fp-ts/lib/Array";
import * as E from "fp-ts/lib/Either";
import * as R from "fp-ts/lib/Record";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
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
} from "ts-endpoint";
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

export interface APIError {
  name: "APIError";
  message: string;
  details?: string[];
}

const toError = (e: unknown): APIError => {
  if (e instanceof Error) {
    return {
      name: "APIError",
      message: e.message,
    };
  }
  return {
    name: "APIError",
    message: "An error occured",
  };
};

export const dataProvider = APIRESTClient({
  url: process.env.REACT_APP_API_URL ?? "http://localhost:4010/v1",
});

// const Resources = {
//   areas: io.http.Area.Area,
//   pages: io.http.Page.PageMD,
//   articles: io.http.Article.Article,
//   actors: io.http.Actor.Actor,
//   groups: io.http.Group.Group,
//   "groups-members": io.http.GroupMember.GroupMember,
//   topics: io.http.Topic.TopicMD,
//   projects: io.http.Project.Project,
//   "project/images": io.http.ProjectImage.ProjectImage,
//   events: io.http.Events.Uncategorized.Uncategorized,
//   deaths: io.http.Events.Death.Death,
// };

// type Resources = {
//   [K in keyof typeof Resources]: t.TypeOf<typeof Resources[K]>;
// };

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

// export type GetOneQuery = <K extends keyof Resources>(
//   r: K
// ) => CachedQuery<GetOneParams, APIError, Resources[K]>;

// export const GetOneQuery: GetOneQuery = <K extends keyof Resources>(k: K) =>
//   queryShallow<GetOneParams, APIError, Resources[K]>(
//     (params: GetOneParams) =>
//       pipe(
//         liftFetch<{ data: Resources[K] }>(
//           () => dataProvider.getOne<Resources[K]>(k, params),
//           t.strict({ data: Resources[k] }).decode as t.Decode<
//             unknown,
//             { data: Resources[K] }
//           >
//         ),
//         TE.map((r) => r.data)
//       ),
//     available
//   );

// export type GetListQuery = <K extends keyof typeof Resources, P = unknown>(
//   r: K
// ) => CachedQuery<
//   P & GetListParams,
//   APIError,
//   { total: number; data: Array<t.TypeOf<typeof Resources[K]>> }
// >;

// export const GetListQuery: GetListQuery = <
//   K extends keyof typeof Resources,
//   P = unknown
// >(
//   r: K
// ) =>
//   queryShallow(
//     (params: P & GetListParams) =>
//       liftFetch(
//         () => dataProvider.getList<t.TypeOf<typeof Resources[K]>>(r, params),
//         io.http.Common.ListOutput(Resources[r], r).decode
//       ),
//     available
//   );

// export const pageContent = GetOneQuery("pages");
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
        TE.fromOption(() => ({
          name: `APIError`,
          message: `Page ${path} is missing`,
        }))
      )
    ),
  available
);

interface Query<G, L> {
  get: CachedQuery<GetOneParams, APIError, G>;
  getList: CachedQuery<GetListParams, APIError, L>;
}

type Queries = {
  [K in keyof Endpoints]: Endpoints[K] extends ResourceEndpoints<
    EndpointInstance<infer G>,
    EndpointInstance<infer L>,
    any,
    any,
    any
  >
    ? Query<
        InferEndpointParams<G>["output"] extends t.ExactType<infer T>
          ? t.TypeOf<T>["data"]
          : never,
        InferEndpointParams<L>["output"] extends t.ExactType<infer T>
          ? t.TypeOf<T>
          : never
      >
    : never;
};

const toQueries = <G extends MinimalEndpoint, L extends MinimalEndpoint>(
  e: ResourceEndpoints<
    EndpointInstance<G>,
    EndpointInstance<L>,
    EndpointInstance<any>,
    EndpointInstance<any>,
    EndpointInstance<any>
  >
): Query<
  InferEndpointParams<G>["output"] extends t.ExactType<infer T>
    ? t.TypeOf<T>
    : never,
  InferEndpointParams<L>["output"] extends t.ExactType<infer T>
    ? t.TypeOf<T>
    : never
> => {
  return {
    get: queryShallow<GetOneParams, APIError, any>(
      (params: GetOneParams) =>
        pipe(
          liftFetch(
            () =>
              dataProvider.getOne<
                InferEndpointParams<G>["output"] & { id: string }
              >(e.Get.getPath(params).split("/")[1], params),
            e.Get.Output.decode
          ),
          TE.map((r) => r.data)
        ),
      available
    ),
    getList: queryShallow<GetListParams, APIError, any>(
      (params: GetListParams) =>
        liftFetch(
          () =>
            dataProvider.getList<
              InferEndpointParams<L>["output"] & { id: string }
            >(e.List.getPath(), params),
          e.List.Output.decode
        ),
      available
    ),
  };
};

const Queries: Queries = pipe(
  Endpoints,
  R.toArray,
  A.reduce<
    [keyof Endpoints, ResourceEndpoints<any, any, any, any, any>],
    Queries
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  >({} as Queries, (q, [k, e]) => ({
    ...q,
    [k]: toQueries(e),
  }))
);

const jsonClient = axios.create({ baseURL: process.env.REACT_APP_DATA_URL });

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
