import axios, { type AxiosResponse, type AxiosRequestConfig } from "axios";
import * as E from "fp-ts/Either";
import * as Task from "fp-ts/Task";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import type * as RA from "react-admin";

export interface APIRESTClient {
  request: <T = any>(config: AxiosRequestConfig<T>) => Promise<any>;
  get: <R = any>(url: string, params: any) => Promise<R>;
  put: (url: string, data?: any) => Promise<AxiosResponse<any>>;
  post: (url: string, data?: any) => Promise<AxiosResponse<any>>;
  getList: <R extends RA.RaRecord>(
    resource: string,
    params: RA.GetListParams,
  ) => Promise<RA.GetListResult<R>>;
  getOne: <R extends RA.RaRecord>(
    resource: string,
    params: RA.GetOneParams,
  ) => Promise<RA.GetOneResult<R>>;
  getMany: <R extends RA.RaRecord>(
    resource: string,
    params: RA.GetManyParams,
  ) => Promise<RA.GetManyResult<R>>;
  getManyReference: <R extends RA.RaRecord>(
    resource: string,
    params: RA.GetManyReferenceParams,
  ) => Promise<RA.GetManyReferenceResult<R>>;
  update: <R extends RA.RaRecord>(
    resource: string,
    params: RA.UpdateParams,
  ) => Promise<RA.UpdateResult<R>>;
  updateMany: (
    resource: string,
    params: RA.UpdateManyParams,
  ) => Promise<RA.UpdateManyResult>;
  create: <R extends Omit<RA.RaRecord, "id">>(
    resource: string,
    params: RA.CreateParams,
  ) => Promise<RA.CreateResult<R & { id: string }>>;
  delete: <R extends RA.RaRecord>(
    resource: string,
    params: RA.DeleteParams,
  ) => Promise<RA.DeleteResult<R>>;
  deleteMany: (
    resource: string,
    params: RA.DeleteManyParams,
  ) => Promise<RA.DeleteManyResult>;
}

const liftClientRequest = <T>(
  promiseL: () => Promise<AxiosResponse<T>>,
): Task.Task<T> => {
  return pipe(
    TE.tryCatch(promiseL, E.toError),
    TE.map((r) => r.data),
    TE.fold((e) => () => Promise.reject(e), Task.of),
  );
};

const formatParams = <P extends RA.GetListParams | RA.GetManyReferenceParams>(
  params: P,
): RA.GetListParams => {
  const sort = params?.sort ?? { field: "createdAt", order: "ASC" };
  const pagination = params?.pagination ?? { perPage: 20, page: 1 };
  return {
    _sort: sort.field,
    _order: sort.order,
    ...params.filter,
    _start: pagination.page * pagination.perPage - pagination.perPage,
    _end: pagination.perPage,
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
  });

  if (getAuth !== undefined) {
    client.interceptors.request.use((req) => {
      req.headers.set("Authorization", `Bearer ${getAuth()}`);
      return req;
    });
  }

  return {
    request: <T>(config: AxiosRequestConfig<T>) =>
      liftClientRequest(() => client.request<T>(config))(),
    get: (url, params) =>
      liftClientRequest(() => client.get(url, { params }))(),
    post: (url, data) => liftClientRequest<any>(() => client.post(url, data))(),
    put: (url, data) => liftClientRequest<any>(() => client.put(url, data))(),
    getOne: (resource, params) =>
      liftClientRequest<RA.GetOneResult<any>>(() =>
        client.get(`${resource}/${params.id}`, { params }),
      )(),
    getList: (resource, params) => {
      return liftClientRequest<RA.GetListResult<any>>(() =>
        client.get(resource, {
          params: formatParams(params),
        }),
      )();
    },
    getMany: (resource, params) => {
      return liftClientRequest<RA.GetManyResult<any>>(() =>
        client.get(`${resource}`, { params }),
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
        client.get(`${resource}`, { params: formattedParams }),
      )();
    },
    create: (resource, params) => {
      return liftClientRequest<RA.CreateResult>(() =>
        client.post(`${resource}`, params.data),
      )();
    },
    update: (resource, params) => {
      return liftClientRequest<RA.UpdateResult>(() =>
        client.put(`${resource}/${params.id}`, params.data),
      )();
    },
    updateMany: (resource, params) => client.put(`${resource}`, { params }),
    delete: (resource, params) =>
      client.delete(`${resource}/${params.id}`, { params }),
    deleteMany: (resource, params) => client.delete(resource, { params }),
  };
};
