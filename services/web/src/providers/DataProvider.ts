import {
  Actor,
  Area,
  Article,
  Events,
  Group,
  Page,
  Project,
  Topic,
} from "@econnessione/shared/lib/io/http";
import { available, queryStrict } from "avenger";
import { CachedQuery } from "avenger/lib/Query";
import * as E from "fp-ts/lib/Either";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import * as t from "io-ts";
import { nonEmptyArray } from "io-ts-types/lib/nonEmptyArray";
import { PathReporter } from "io-ts/lib/PathReporter";
import type {
  GetListParams,
  GetListResult,
  GetOneParams,
  GetOneResult,
} from "react-admin";
import { APIClient } from "./APIClient";

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

export const dataProvider = APIClient({
  url: "http://localhost:4010/v1",
});

// interface WithId { id: t.StringC }


const Resources = {
  areas: Area.AreaMD,
  pages: Page.PageMD,
  articles: Article.Article,
  actors: Actor.Actor,
  groups: Group.Group,
  topics: Topic.TopicMD,
  projects: Project.ProjectMD,
  events: Events.Event,
};

const liftFetch = <
  C extends t.Any,
  R extends GetOneResult<t.TypeOf<C>> | GetListResult<t.TypeOf<C>>
>(
  lp: () => Promise<R>,
  codec: C
): TE.TaskEither<APIError, R["data"]> => {
  return pipe(
    TE.tryCatch(lp, toError),
    // TE.map((result) => {
    //   // eslint-disable-next-line
    //   console.log("result", result);
    //   return result;
    // }),
    TE.map(({ data }) => data),
    TE.chain((content) => {
      // eslint-disable-next-line
      // console.log(content)
      return pipe(
        codec.decode(content),
        E.mapLeft(
          (e): APIError => ({
            name: `APIError`,
            message: "validation failed",
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
  queryStrict(
    (params: GetOneParams) =>
      liftFetch(
        () => dataProvider.getOne<t.TypeOf<typeof Resources[K]>>(r, params),
        Resources[r]
      ),
    available
  );

export type GetListQuery = <K extends keyof typeof Resources>(
  r: K
) => CachedQuery<GetListParams, APIError, Array<t.TypeOf<typeof Resources[K]>>>;

export const GetListQuery: GetListQuery = <K extends keyof typeof Resources>(
  r: K
) =>
  queryStrict(
    (params: GetListParams) =>
      liftFetch(
        () => dataProvider.getList<t.TypeOf<typeof Resources[K]>>(r, params),
        t.array(Resources[r])
      ),
    available
  );

export const pageContent = GetOneQuery("pages");
export const pageContentByPath = queryStrict<
  { path: string },
  APIError,
  Page.Page
>(
  ({ path }) =>
    pipe(
      liftFetch(
        () => dataProvider.get("/pages", { path }),
        nonEmptyArray(Page.Page)
      ),
      TE.map((pages) => pages[0])
    ),
  available
);

export const pagesList = GetListQuery("pages");
export const actorsList = GetListQuery("actors");
export const articlesList = GetListQuery("articles");
export const groupsList = GetListQuery("groups");
export const topicsList = GetListQuery("topics");
export const projectList = GetListQuery("projects");
export const eventsList = GetListQuery("events");
export const areasList = GetListQuery("areas");

export const jsonData = queryStrict(
  ({ id }: { id: string }) =>
    liftFetch(() => dataProvider.getOne("graphs", { id }), t.any),
  available
);

export const project = GetOneQuery("projects");
export const group = GetOneQuery('groups')
export const actor = GetOneQuery('actors')
