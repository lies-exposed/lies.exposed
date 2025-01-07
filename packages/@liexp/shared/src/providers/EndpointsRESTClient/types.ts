import type * as TE from "fp-ts/lib/TaskEither.js";
import type * as t from "io-ts";
// eslint-disable-next-line no-restricted-imports
import type { DeleteParams, GetListParams } from "react-admin";
import {
  type EndpointInstance,
  type InferEndpointInstanceParams,
  type InferEndpointParams,
  type MinimalEndpointInstance,
} from "ts-endpoint";
import { type serializedType } from "ts-io-error/lib/Codec.js";
import { type EndpointsMapType } from "../../endpoints/Endpoints.js";
import { type ResourceEndpoints } from "../../endpoints/types.js";
import { type APIError } from "../../io/http/Error/APIError.js";
import { type APIRESTClient } from "../api-rest.provider.js";

export type GetFnParams<G> =
  InferEndpointParams<G>["params"] extends t.ExactType<infer T>
    ? t.TypeOf<T>
    : InferEndpointParams<G>["params"] extends undefined
      ? undefined
      : serializedType<InferEndpointParams<G>["params"]>;

export type GetListFnParamsE<L> = Partial<Omit<GetListParams, "filter">> & {
  filter?: Partial<
    serializedType<
      L extends MinimalEndpointInstance
        ? InferEndpointInstanceParams<L>["query"]
        : InferEndpointParams<L>["query"]
    >
  > | null;
};

export type CreateFnParams<C> = InferEndpointParams<C>["body"] extends undefined
  ? undefined
  : serializedType<InferEndpointParams<C>["body"]>;

export type EditFnParams<C> = Partial<
  serializedType<InferEndpointParams<C>["body"]>
> &
  serializedType<InferEndpointParams<C>["params"]>;

export type GetEndpointQueryType<G> =
  InferEndpointParams<G>["query"] extends t.ExactType<infer T>
    ? t.TypeOf<T>
    : InferEndpointParams<G>["query"] extends undefined
      ? undefined
      : serializedType<InferEndpointParams<G>["query"]>;

export type EndpointOutput<L> =
  InferEndpointParams<L>["output"] extends t.ExactType<infer T>
    ? t.TypeOf<T>["data"] extends unknown[]
      ? t.TypeOf<T>
      : t.TypeOf<T>["data"]
    : never;

export type EndpointDataOutput<L> =
  InferEndpointParams<L>["output"] extends t.ExactType<infer T>
    ? t.TypeOf<T>
    : never;

export type GetFn<G> = (
  params: GetFnParams<G>,
  query?: Partial<serializedType<InferEndpointParams<G>["query"]>>,
) => TE.TaskEither<APIError, EndpointOutput<G>>;

type GetListFnParams<L, O = undefined> = O extends undefined
  ? Omit<GetListParams, "filter"> & { filter: Partial<GetEndpointQueryType<L>> }
  : O;

export type GetListFn<L, O = undefined> = (
  params: GetListFnParams<L, O>,
) => TE.TaskEither<APIError, EndpointOutput<L>>;

type CreateFn<C> = (
  params: CreateFnParams<C>,
) => TE.TaskEither<APIError, EndpointOutput<C>>;

type EditFn<C> = (
  params: EditFnParams<C>,
) => TE.TaskEither<APIError, EndpointOutput<C>>;

type DeleteFn<C> = (
  params: DeleteParams<any>,
) => TE.TaskEither<APIError, EndpointOutput<C>>;

type CustomEndpointParams<C> =
  (InferEndpointInstanceParams<C>["headers"] extends t.Mixed
    ? {
        Headers: serializedType<InferEndpointInstanceParams<C>["headers"]>;
      }
    : Record<string, unknown>) &
    (InferEndpointInstanceParams<C>["body"] extends undefined
      ? Record<string, unknown>
      : {
          Body: serializedType<InferEndpointInstanceParams<C>["body"]>;
        });

export type CustomEndpointFn<C extends MinimalEndpointInstance> = (
  params: CustomEndpointParams<C>,
  q?: any,
) => TE.TaskEither<APIError, EndpointDataOutput<C>>;

export type CustomEndpointsRecord<CC> =
  CC extends Record<string, MinimalEndpointInstance>
    ? {
        [K in keyof CC]: CustomEndpointFn<CC[K]>;
      }
    : never;

export interface EndpointREST<G, L, C, E, D, CC> {
  get: GetFn<G>;
  getList: GetListFn<L>;
  post: CreateFn<C>;
  edit: EditFn<E>;
  delete: DeleteFn<D>;
  Custom: CustomEndpointsRecord<CC>;
}

export type FromRestEndpoints<E> =
  E extends ResourceEndpoints<
    EndpointInstance<infer G>,
    EndpointInstance<infer L>,
    EndpointInstance<infer C>,
    EndpointInstance<infer E>,
    EndpointInstance<infer D>,
    infer CC
  >
    ? EndpointREST<G, L, C, E, D, CC>
    : never;

export interface EndpointsRESTClient<ES extends EndpointsMapType> {
  Endpoints: {
    [K in keyof ES]: FromRestEndpoints<ES[K]>;
  };
  client: APIRESTClient;
}
