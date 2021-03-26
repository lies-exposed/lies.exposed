import { APIRESTClient } from "@econnessione/core/http/APIRESTClient";
import * as io from "@io/index";
import { available, queryStrict, queryShallow } from "avenger";
import { CachedQuery } from "avenger/lib/Query";
import * as E from "fp-ts/lib/Either";
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
  url: process.env.REACT_APP_API_URL,
});

const Resources = {
  areas: io.http.Area.Area,
  pages: io.http.Page.PageMD,
  articles: io.http.Article.Article,
  actors: io.http.Actor.Actor,
  groups: io.http.Group.Group,
  "groups-members": io.http.GroupMember.GroupMember,
  topics: io.http.Topic.TopicMD,
  projects: io.http.Project.Project,
  "project/images": io.http.ProjectImage.ProjectImage,
  events: io.http.Events.Uncategorized.Uncategorized,
};

const liftFetch = <
  C extends t.Any,
  R extends
    | GetOneResult<t.TypeOf<C>["data"]>
    | GetListResult<t.TypeOf<C>["data"]>
>(
  lp: () => Promise<R>,
  codec: C
): TE.TaskEither<APIError, R> => {
  return pipe(
    TE.tryCatch(lp, toError),
    TE.chain<APIError, R, t.TypeOf<C>>((content) => {
      return pipe(
        codec.decode(content),
        E.mapLeft(
          (e): APIError => ({
            name: `APIError`,
            message: `Validation Failed for codec ${codec.name}`,
            details: PathReporter.report(E.left(e)),
          })
        ),
        TE.fromEither
      );
    })
  );
};

export type GetOneQuery = <K extends keyof typeof Resources>(
  r: K
) => CachedQuery<GetOneParams, APIError, t.TypeOf<typeof Resources[K]>>;

export const GetOneQuery: GetOneQuery = <K extends keyof typeof Resources>(
  r: K
) =>
  queryShallow<GetOneParams, APIError, t.TypeOf<typeof Resources[K]>>(
    (params: GetOneParams) =>
      pipe(
        liftFetch(
          () => dataProvider.getOne<t.TypeOf<typeof Resources[K]>>(r, params),
          t.strict({ data: Resources[r] })
        ),
        TE.map((r): t.TypeOf<typeof Resources[K]> => r.data)
      ),
    available
  );

export type GetListQuery = <K extends keyof typeof Resources, P = unknown>(
  r: K
) => CachedQuery<
  P & GetListParams,
  APIError,
  { total: number; data: Array<t.TypeOf<typeof Resources[K]>> }
>;

export const GetListQuery: GetListQuery = <
  K extends keyof typeof Resources,
  P = unknown
>(
  r: K
) =>
  queryShallow(
    (params: P & GetListParams) =>
      liftFetch(
        () => dataProvider.getList<t.TypeOf<typeof Resources[K]>>(r, params),
        io.http.Common.ListOutput(Resources[r], r)
      ),
    available
  );

export const pageContent = GetOneQuery("pages");
export const pageContentByPath = queryStrict<
  { path: string },
  APIError,
  io.http.Page.Page
>(
  ({ path }) =>
    pipe(
      liftFetch(
        () =>
          dataProvider.getList<io.http.Page.Page>("/pages", {
            filter: { path },
            pagination: { page: 0, perPage: 20 },
            sort: { field: "id", order: "DESC" },
          }),
        io.http.Common.ListOutput(io.http.Page.Page, "PageList")
      ),
      TE.map((pages) => pages.data[0])
    ),
  available
);

export const pagesList = GetListQuery("pages");
export const actorsList = GetListQuery("actors");
export const articlesList = GetListQuery("articles");
export const groupsList = GetListQuery("groups");
export const groupMembersList = GetListQuery("groups-members");
export const topicsList = GetListQuery("topics");
export const projectList = GetListQuery("projects");
export const projectImageList = GetListQuery("project/images");
export const eventsList = GetListQuery("events");
export const areasList = GetListQuery("areas");

export const jsonData = queryShallow(
  ({ id }: { id: string }) =>
    liftFetch(() => dataProvider.getOne("graphs", { id }), t.any),
  available
);

export const jsonLocalData = queryShallow(
  ({ path }: { path: string }) =>
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    TE.right<APIError, any>(require(`${path}.json`)),
  available
);

export const area = GetOneQuery("areas");
export const project = GetOneQuery("projects");
export const group = GetOneQuery("groups");
export const actor = GetOneQuery("actors");
export const article = GetOneQuery("articles");
export const event = GetOneQuery("events");

export const articleByPath = queryShallow<
  { path: string },
  APIError,
  io.http.Article.Article
>(
  ({ path }) =>
    pipe(
      liftFetch(
        () => dataProvider.get("articles", { path }),
        io.http.Common.ListOutput(io.http.Article.Article, "Articles")
      ),
      TE.map((pages) => pages.data[0])
    ),
  available
);
