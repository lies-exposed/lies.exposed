import { ActorMD, PageMD } from "@econnessione/io"
import { available, queryStrict } from "avenger"
import { CachedQuery } from "avenger/lib/Query"
import * as E from 'fp-ts/lib/Either'
import { pipe } from "fp-ts/lib/pipeable"
import * as TE from "fp-ts/lib/TaskEither"
import * as t from "io-ts"
import jsonServerProvider from "ra-data-json-server"
import {
  fetchUtils,
  GetListParams,
  GetListResult,
  GetOneParams,
  GetOneResult
} from "react-admin"

const httpClient = (
  url: string,
  options: fetchUtils.Options = {}
): Promise<any> => {
  if (!options.headers) {
    options.headers = new Headers({ Accept: "application/json" })
  }
  // add your own headers here
  // options.headers.set('X-Custom-Header', 'foobar');
  console.log(url)
  return fetchUtils.fetchJson(url, options)
}

type APIError = {
  name: "APIError"
  message: string
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

export const dataProvider = jsonServerProvider(
  "http://localhost:4010",
  httpClient
)

// interface WithId { id: t.StringC }

// interface Resources {
//   [key: string]: t.ExactC<WithId>
// }

const Resources = {
  actors: ActorMD,
  pages: PageMD,
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
    TE.map(({ data }) => data),
    TE.chain((content) => {
      return pipe(
        (codec.decode(content)),
          E.mapLeft((e) => ({
          name: `APIError` as const,
          message: "validation failed",
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

export const actorsList = GetListQuery("actors")

// import { ActorFrontmatter } from "@models/actor"
// import * as Task from "fp-ts/lib/Task"
// import * as TE from "fp-ts/lib/TaskEither"
// import { pipe } from "fp-ts/lib/pipeable"
// import * as RA from "react-admin"

// interface DataProvider<Resource> {
//   getList: <R>(
//     resource: Resource,
//     params: RA.GetListParams
//   ) => Promise<RA.GetListResult<R>>
//   getOne: <R>(
//     resource: Resource,
//     params: RA.GetOneParams
//   ) => Promise<RA.GetOneResult<R>>
//   getMany: <R>(
//     resource: Resource,
//     params: RA.GetManyParams
//   ) => Promise<RA.GetManyResult<R>>
//   getManyReference: <R>(
//     resource: Resource,
//     params: RA.GetManyReferenceParams
//   ) => Promise<RA.GetManyReferenceResult<R>>
//   update: <R>(
//     resource: Resource,
//     params: RA.UpdateParams
//   ) => Promise<RA.UpdateResult<R>>
//   updateMany: (
//     resource: Resource,
//     params: RA.UpdateManyParams
//   ) => Promise<RA.UpdateManyResult>
//   create: <RecordType>(
//     resource: Resource,
//     params: RA.CreateParams
//   ) => Promise<RA.CreateResult<RecordType>>
//   delete: <RecordType>(
//     resource: Resource,
//     params: RA.DeleteParams
//   ) => Promise<RA.DeleteResult<RecordType>>
//   deleteMany: (
//     resource: Resource,
//     params: RA.DeleteManyParams
//   ) => Promise<RA.DeleteManyResult>
//   [key: string]: any
// }

// interface ResourceProvider<Output> {
//   getList: (
//     params: RA.GetListParams
//   ) => TE.TaskEither<Error, RA.GetListResult<Output>>
//   getOne: (
//     params: RA.GetOneParams
//   ) => TE.TaskEither<Error, RA.GetOneResult<Output>>
//   getMany: (
//     params: RA.GetManyParams
//   ) => TE.TaskEither<Error, RA.GetManyResult<Output>>
//   getManyReference: (
//     params: RA.GetManyReferenceParams
//   ) => TE.TaskEither<Error, RA.GetManyReferenceResult<Output>>
//   update: (
//     params: RA.UpdateParams
//   ) => TE.TaskEither<Error, RA.UpdateResult<Output>>
//   updateMany: (
//     params: RA.UpdateManyParams
//   ) => TE.TaskEither<Error, RA.UpdateManyResult>
//   create: (
//     params: RA.CreateParams
//   ) => TE.TaskEither<Error, RA.CreateResult<Output>>
//   delete: (
//     params: RA.DeleteParams
//   ) => TE.TaskEither<Error, RA.DeleteResult<Output>>
//   deleteMany: (
//     params: RA.DeleteManyParams
//   ) => TE.TaskEither<Error, RA.DeleteManyResult>
// }

// interface APIClient {
//   actors: ResourceProvider<ActorFrontmatter>
// }

// type Resource = keyof APIClient

// const foldRequest = <A>(te: TE.TaskEither<Error, A>): (() => Promise<A>) => {
//   return pipe(
//     te,
//     TE.fold(
//       (e) => async () => await Promise.reject(e),
//       (a) => Task.task.of(a)
//     )
//   )
// }

// const fetch = (url, params) =>

// const getDataProvider = () =>  (resource: string) =>

// interface APIClientContext {
//   baseURL: string
// }

// const APIClient = (ctx: APIClientContext): APIClient => {
//   const api = 1
//   return {
//     actors: {
//       getOne: (params) => {}
//     }
//   }
// }

// interface APIDataProviderContext {
//   baseURL: string
// }

// export const APIDataProvider: DataProvider<Resource> = (ctx: APIDataProviderContext) => {

//   return {
//   getOne: async (resource, params) =>
//     foldRequest(api[resource].getOne(params))(),
//   getList: async (resource, params) =>
//     foldRequest(api[resource].getList(params))()
//   ,
// }
// }
