import axios from "axios"
import * as RA from "react-admin"

type Resource = "pages" | "actors"

export interface APIClient {
  getList: <R>(
    resource: Resource,
    params: RA.GetListParams
  ) => Promise<RA.GetListResult<R>>
  getOne: <R>(
    resource: Resource,
    params: RA.GetOneParams
  ) => Promise<RA.GetOneResult<R>>
  getMany: <R>(
    resource: Resource,
    params: RA.GetManyParams
  ) => Promise<RA.GetManyResult<R>>
  getManyReference: <R>(
    resource: Resource,
    params: RA.GetManyReferenceParams
  ) => Promise<RA.GetManyReferenceResult<R>>
  update: <R>(
    resource: Resource,
    params: RA.UpdateParams
  ) => Promise<RA.UpdateResult<R>>
  updateMany: (
    resource: Resource,
    params: RA.UpdateManyParams
  ) => Promise<RA.UpdateManyResult>
  create: <RecordType>(
    resource: Resource,
    params: RA.CreateParams
  ) => Promise<RA.CreateResult<RecordType>>
  delete: <RecordType>(
    resource: Resource,
    params: RA.DeleteParams
  ) => Promise<RA.DeleteResult<RecordType>>
  deleteMany: (
    resource: Resource,
    params: RA.DeleteManyParams
  ) => Promise<RA.DeleteManyResult>
  [key: string]: any
}

interface APIClientCtx {
  url: string
}

export const APIClient = (ctx: APIClientCtx): APIClient => {
  const client = axios.create({
    baseURL: ctx.url,
  })
  return {
    getOne: (resource, params) => client.get(`${resource}`, { params }),
    getList: (resource, params) => client.get(`${resource}`, { params }),
    getMany: (resource, params) => client.get(`${resource}`, { params }),
    getManyReference: (resource, params) =>
      client.get(`${resource}`, { params }),
    create: (resource, params) => client.post(`${resource}`, { params }),
    update: (resource, params) => client.put(`${resource}`, { params }),
    updateMany: (resource, params) => client.put(`${resource}`, { params }),
    delete: (resource, params) => client.delete(`${resource}`, { params }),
    deleteMany: (resource, params) => client.delete(`${resource}`, { params }),
  }
}

// import { ActorFrontmatter } from "@models/actor"
// import * as Task from "fp-ts/lib/Task"
// import * as TE from "fp-ts/lib/TaskEither"
// import { pipe } from "fp-ts/lib/pipeable"

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
