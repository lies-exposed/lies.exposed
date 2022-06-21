import axios, { AxiosResponse, AxiosRequestConfig } from "axios";
import * as E from "fp-ts/lib/Either";
import * as Task from "fp-ts/lib/Task";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import type * as RA from "react-admin";
import { RaRecord } from 'react-admin';

export interface APIRESTClient {
  request: <T = any>(config: AxiosRequestConfig<T>) => Promise<any>;
  get: (resource: string, params: any) => Promise<any>;
  put: (url: string, data?: any) => Promise<AxiosResponse<any>>;
  getList: <R extends RaRecord>(
    resource: string,
    params: RA.GetListParams
  ) => Promise<RA.GetListResult<R>>;
  getOne: <R extends RaRecord>(
    resource: string,
    params: RA.GetOneParams
  ) => Promise<RA.GetOneResult<R>>;
  getMany: <R extends RaRecord>(
    resource: string,
    params: RA.GetManyParams
  ) => Promise<RA.GetManyResult<R>>;
  getManyReference: <R extends RaRecord>(
    resource: string,
    params: RA.GetManyReferenceParams
  ) => Promise<RA.GetManyReferenceResult<R>>;
  update: <R extends RaRecord>(
    resource: string,
    params: RA.UpdateParams
  ) => Promise<RA.UpdateResult<R>>;
  updateMany: (
    resource: string,
    params: RA.UpdateManyParams
  ) => Promise<RA.UpdateManyResult>;
  create: <R extends Omit<RaRecord, "id">>(
    resource: string,
    params: RA.CreateParams
  ) => Promise<RA.CreateResult<R & { id: string }>>;
  delete: <R extends RaRecord>(
    resource: string,
    params: RA.DeleteParams
  ) => Promise<RA.DeleteResult<R>>;
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
): RA.GetListParams => {
  return {
    _sort: params.sort.field,
    _order: params.sort.order,
    _start:
      params.pagination.page * params.pagination.perPage -
      params.pagination.perPage,
    _end: params.pagination.perPage * params.pagination.page,
    ...params.filter,
  };
};

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
    responseType: "json",
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
    request: <T>(config: AxiosRequestConfig<T>) =>
      liftClientRequest(() => client.request<T>(config))(),
    get: (url, params) =>
      liftClientRequest(() => client.get(url, { params }))(),
    put: (url, data) => liftClientRequest<any>(() => client.put(url, data))(),
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
      return liftClientRequest<RA.CreateResult>(() =>
        client.post(`${resource}`, params.data)
      )();
    },
    update: (resource, params) => {
      return liftClientRequest<RA.UpdateResult>(() =>
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
