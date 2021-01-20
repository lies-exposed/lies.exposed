import axios, { AxiosResponse } from "axios";
import * as E from "fp-ts/lib/Either";
import * as Task from "fp-ts/lib/Task";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import qs from "query-string";
import * as RA from "react-admin";

interface APIRESTClient {
  get: (resource: string, params: any) => Promise<any>;
  getList: <R extends RA.Record>(
    resource: string,
    params: RA.GetListParams
  ) => Promise<RA.GetListResult<R>>;
  getOne: <R extends RA.Record>(
    resource: string,
    params: RA.GetOneParams
  ) => Promise<RA.GetOneResult<R>>;
  getMany: <R extends RA.Record>(
    resource: string,
    params: RA.GetManyParams
  ) => Promise<RA.GetManyResult<R>>;
  getManyReference: <R extends RA.Record>(
    resource: string,
    params: RA.GetManyReferenceParams
  ) => Promise<RA.GetManyReferenceResult<R>>;
  update: <R>(
    resource: string,
    params: RA.UpdateParams
  ) => Promise<RA.UpdateResult<R>>;
  updateMany: (
    resource: string,
    params: RA.UpdateManyParams
  ) => Promise<RA.UpdateManyResult>;
  create: <RecordType>(
    resource: string,
    params: RA.CreateParams
  ) => Promise<RA.CreateResult<RecordType>>;
  delete: <RecordType>(
    resource: string,
    params: RA.DeleteParams
  ) => Promise<RA.DeleteResult<RecordType>>;
  deleteMany: (
    resource: string,
    params: RA.DeleteManyParams
  ) => Promise<RA.DeleteManyResult>;
}

const liftClientRequest = <T>(
  promiseL: () => Promise<AxiosResponse<T>>
): Task.Task<T> => {
  return pipe(
    TE.tryCatch(promiseL, E.toError),
    TE.map((r) => r.data),
    TE.fold((e) => () => Promise.reject(e), Task.of)
  );
};

interface APIRESTClientCtx {
  url: string;
}

const APIRESTClient = (ctx: APIRESTClientCtx): APIRESTClient => {
  const client = axios.create({
    baseURL: ctx.url,
  });

  return {
    get: (url, params) =>
      liftClientRequest(() => client.get(url, { params }))(),
    getOne: (resource, params) =>
      liftClientRequest<RA.GetOneResult<any>>(() =>
        client.get(`${resource}/${params.id}`)
      )(),
    getList: (resource, params) => {
      const pagination = qs.stringify(params.pagination as any);
      return liftClientRequest<RA.GetListResult<any>>(() =>
        client.get(`${resource}`, { params: pagination })
      )();
    },
    getMany: (resource, params) => client.get(`${resource}`, { params }),
    getManyReference: (resource, params) =>
      client.get(`${resource}`, { params }),
    create: (resource, params) => {
      return liftClientRequest<RA.CreateParams>(() =>
        client.post(`${resource}`, params.data)
      )();
    },
    update: (resource, params) => {
      return liftClientRequest<RA.UpdateParams>(() =>
        client.put(`${resource}/${params.id}`, params.data)
      )();
    },
    updateMany: (resource, params) => client.put(`${resource}`, { params }),
    delete: (resource, params) => {
      // eslint-disable-next-line no-console
      return client.delete(`${resource}/${params.id}`, { params });
    },
    deleteMany: (resource, params) => client.delete(`${resource}`, { params }),
  };
};

export { APIRESTClient, APIRESTClientCtx };
