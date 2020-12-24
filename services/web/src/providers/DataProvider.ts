import { ActorMD, PageMD, TopicMD } from "@econnessione/io"
import { available, queryStrict } from "avenger"
import { CachedQuery } from "avenger/lib/Query"
import * as E from "fp-ts/lib/Either"
import { pipe } from "fp-ts/lib/pipeable"
import * as TE from "fp-ts/lib/TaskEither"
import * as t from "io-ts"
import { PathReporter } from "io-ts/lib/PathReporter"
import {
  GetListParams,
  GetListResult,
  GetOneParams,
  GetOneResult
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

type APIError = {
  name: "APIError"
  message: string,
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
  actors: ActorMD,
  pages: PageMD,
  topics: TopicMD
}

type FetchResult<R, C extends t.Any> = R extends GetOneResult<infer A>
  ? t.TypeOf<C>
  : R extends GetListResult<infer L>
  ? t.TypeOf<C>[]
  : never

const liftFetch = <
  C extends t.Any,
  R extends GetOneResult<any> | GetListResult<any>
>(
  lp: () => Promise<R>,
  codec: C
): TE.TaskEither<APIError, FetchResult<R, C>> => {
  return pipe(
    TE.tryCatch(lp, toError),
    TE.map((result) => {
      console.log("result", result)
      return result
    }),
    TE.map(({ data }) => data),
    TE.chain((content) => {
      return pipe(
        codec.decode(content),
        E.mapLeft((e): APIError => ({
          name: `APIError`,
          message: "validation failed",
          details: PathReporter.report(E.left(e)),
        })),
        TE.fromEither
      )
    })
  )
}

export type GetOneQuery = <K extends keyof typeof Resources>(
  r: K
) => CachedQuery<GetOneParams, APIError, GetOneResult<typeof Resources[K]>>

export const GetOneQuery = <K extends keyof typeof Resources>(r: K) =>
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
) => CachedQuery<GetListParams, APIError, GetListResult<typeof Resources[K]>>

export const GetListQuery = <K extends keyof typeof Resources>(r: K) =>
  queryStrict(
    (params: GetListParams) =>
      liftFetch(
        () => dataProvider.getList<t.TypeOf<typeof Resources[K]>>(r, params),
        t.array(Resources[r])
      ),
    available
  )

export const onePage = GetOneQuery("pages")
export const pagesList = GetListQuery("pages")
export const actorsList = GetListQuery("actors")
export const topicsList = GetListQuery("topics")
