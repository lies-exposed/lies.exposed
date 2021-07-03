import axios, { AxiosResponse } from "axios";
import * as E from "fp-ts/lib/Either";
import * as Task from "fp-ts/lib/Task";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import type * as RA from "react-admin";

export interface APIRESTClient {
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

const formatParams = <P extends RA.GetListParams | RA.GetManyReferenceParams>(
  params: P
): RA.GetListParams => ({
  _sort: params.sort.field,
  _order: params.sort.order,
  _start:
    params.pagination.page * params.pagination.perPage -
    params.pagination.perPage,
  _end: params.pagination.perPage * params.pagination.page,
  ...params.filter,
});

export interface APIRESTClientCtx {
  url: string;
  getAuth?: () => string | null;
}

export const APIRESTClient = ({
  getAuth,
  ...ctx
}: APIRESTClientCtx): APIRESTClient => {
  const client = axios.create({
    baseURL: ctx.url,
  });

  if (getAuth !== undefined) {
    client.interceptors.request.use((req) => {
      req.headers = {
        ...req.headers,
        Authorization: `Bearer ${getAuth()}`,
      };
      return req;
    });
  }

  return {
    get: (url, params) =>
      liftClientRequest(() => client.get(url, { params }))(),
    getOne: (resource, params) =>
      liftClientRequest<RA.GetOneResult<any>>(() =>
        client.get(`${resource}/${params.id}`, { params })
      )(),
    getList: (resource, params) => {
      return liftClientRequest<RA.GetListResult<any>>(() =>
        client.get(resource, {
          params: formatParams(params),
        })
      )();
    },
    getMany: (resource, params) => {
      return liftClientRequest<RA.GetManyResult<any>>(() =>
        client.get(`${resource}`, { params: params })
      )();
    },
    getManyReference: (resource, params) => {
      const formattedParams = formatParams({
        ...params,
        filter: {
          ...params.filter,
          [params.target]: params.id,
        },
      });
      return liftClientRequest<RA.GetManyReferenceResult<any>>(() =>
        client.get(`${resource}`, { params: formattedParams })
      )();
    },
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
    deleteMany: (resource, params) => client.delete(resource, { params }),
  };
};
