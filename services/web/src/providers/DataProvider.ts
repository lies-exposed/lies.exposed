import {
  Actor,
  Area,
  Article,
  Events,
  Group,
  Page,
  Project,
  Topic,
} from "@econnessione/io"
import { available, queryStrict } from "avenger"
import { CachedQuery } from "avenger/lib/Query"
import * as E from "fp-ts/lib/Either"
import * as TE from "fp-ts/lib/TaskEither"
import { pipe } from "fp-ts/lib/pipeable"
import * as t from "io-ts"
import { PathReporter } from "io-ts/lib/PathReporter"
import {
  GetListParams,
  GetListResult,
  GetOneParams,
  GetOneResult,
} from "react-admin"
import { APIClient } from "./APIClient"

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
  name: "APIError"
  message: string
  details?: string[]
}

const toError = (e: unknown): APIError => {
  if (e instanceof Error) {
    return {
      name: "APIError",
      message: e.message,
    }
  }
  return {
    name: "APIError",
    message: "An error occured",
  }
}

export const dataProvider = APIClient({
  url: "http://localhost:4010",
})

// interface WithId { id: t.StringC }

// interface Resources {
//   [key: string]: t.ExactC<WithId>
// }

const Resources = {
  areas: Area.AreaMD,
  pages: Page.PageMD,
  articles: Article.ArticleMD,
  actors: Actor.ActorMD,
  groups: Group.GroupMD,
  topics: Topic.TopicMD,
  projects: Project.ProjectMD,
  events: Events.EventMD,
}

const liftFetch = <
  C extends t.Any,
  R extends GetOneResult<t.TypeOf<C>> | GetListResult<t.TypeOf<C>>
>(
  lp: () => Promise<R>,
  codec: C
): TE.TaskEither<APIError, R["data"]> => {
  return pipe(
    TE.tryCatch(lp, toError),
    TE.map((result) => {
      // eslint-disable-next-line
      console.log("result", result)
      return result
    }),
    TE.map(({ data }) => data),
    TE.chain((content) => {
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
      )
    })
  )
}

export type GetOneQuery = <K extends keyof typeof Resources>(
  r: K
) => CachedQuery<GetOneParams, APIError, t.TypeOf<typeof Resources[K]>>

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
  )

export type GetListQuery = <K extends keyof typeof Resources>(
  r: K
) => CachedQuery<GetListParams, APIError, Array<t.TypeOf<typeof Resources[K]>>>

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
  )

export const pageContent = GetOneQuery("pages")
export const pagesList = GetListQuery("pages")
export const actorsList = GetListQuery("actors")
export const articlesList = GetListQuery("articles")
export const groupsList = GetListQuery("groups")
export const topicsList = GetListQuery("topics")
export const projectList = GetListQuery("projects")
export const eventsList = GetListQuery("events")
export const areasList = GetListQuery("areas")

export const jsonData = queryStrict(
  ({ id }: { id: string }) =>
    liftFetch(() => dataProvider.getOne("data", { id }), t.any),
  available
)


export const project = GetOneQuery('projects')