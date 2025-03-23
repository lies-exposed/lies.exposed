import type * as TE from "fp-ts/lib/TaskEither.js";
// eslint-disable-next-line no-restricted-imports
import type { DeleteParams, GetListParams } from "react-admin";
import {
  type EndpointInstance,
  type InferEndpointInstanceParams,
  type InferEndpointParams,
  type MinimalEndpointInstance,
  type ResourceEndpoints,
} from "ts-endpoint";
import {
  type PartialSerializedType,
  type Codec,
  type RecordCodec,
  type RecordCodecEncoded,
  type RecordCodecSerialized,
  type runtimeType,
  type serializedType,
} from "ts-io-error";
import { type EndpointsMapType } from "../../endpoints/Endpoints.js";
import { type APIError } from "../../io/http/Error/APIError.js";
import { type APIRESTClient } from "../api-rest.provider.js";

export type GetFnParams<G> = G extends MinimalEndpointInstance
  ? InferEndpointInstanceParams<G>["params"] extends undefined
    ? undefined
    : serializedType<InferEndpointInstanceParams<G>["params"]>
  : never;

export type GetListFnParamsE<L> = Partial<Omit<GetListParams, "filter">> & {
  filter?: Partial<
    RecordCodecEncoded<
      L extends MinimalEndpointInstance
        ? InferEndpointInstanceParams<L>["query"]
        : InferEndpointParams<L>["query"]
    >
  >;
};

export type CreateFnParams<C> = InferEndpointParams<C>["body"] extends undefined
  ? undefined
  : runtimeType<InferEndpointParams<C>["body"]>;

export type EditFnParams<C> = Partial<
  runtimeType<InferEndpointParams<C>["body"]>
> &
  runtimeType<InferEndpointParams<C>["params"]>;

export type GetEndpointQueryType<G> =
  InferEndpointInstanceParams<G>["query"] extends undefined
    ? undefined
    : G extends MinimalEndpointInstance
      ? RecordCodecEncoded<InferEndpointInstanceParams<G>["query"]>
      : RecordCodecEncoded<InferEndpointParams<G>["query"]>;

export type EndpointDataOutputType<L> = L extends MinimalEndpointInstance
  ? InferEndpointInstanceParams<L>["output"] extends RecordCodec<infer T>
    ? RecordCodecSerialized<T>["data"] extends unknown[]
      ? RecordCodecSerialized<T>
      : RecordCodecSerialized<T>["data"]
    : never
  : InferEndpointParams<L>["output"] extends RecordCodec<infer T>
    ? RecordCodecSerialized<T>["data"] extends unknown[]
      ? RecordCodecSerialized<T>
      : RecordCodecSerialized<T>["data"]
    : never;

export type EndpointDataOutput<L> =
  InferEndpointInstanceParams<L>["output"] extends RecordCodec<infer T>
    ? RecordCodecSerialized<T>
    : never;

export type EndpointOutputType<L> =
  InferEndpointParams<L>["output"] extends RecordCodec<infer T>
    ? RecordCodecSerialized<T>
    : never;

export type GetFn<G> = (
  params: GetFnParams<G>,
  query?: PartialSerializedType<InferEndpointInstanceParams<G>["query"]>,
) => TE.TaskEither<APIError, EndpointDataOutputType<G>>;

type GetListFnParams<L, O = undefined> = O extends undefined
  ? Omit<GetListParams, "filter"> & { filter: Partial<GetEndpointQueryType<L>> }
  : O;

export type GetListFn<L, O = undefined> = (
  params: GetListFnParams<L, O>,
) => TE.TaskEither<APIError, EndpointDataOutput<L>>;

type CreateFn<C> = (
  params: CreateFnParams<C>,
) => TE.TaskEither<APIError, EndpointDataOutputType<C>>;

type EditFn<C> = (
  params: EditFnParams<C>,
) => TE.TaskEither<APIError, EndpointDataOutputType<C>>;

type DeleteFn<C> = (
  params: DeleteParams<any>,
) => TE.TaskEither<APIError, EndpointDataOutputType<C>>;

type CustomEndpointParams<C> =
  (InferEndpointInstanceParams<C>["headers"] extends Codec<any>
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
) => TE.TaskEither<
  APIError,
  runtimeType<InferEndpointInstanceParams<C>["output"]>
>;

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

export type ResourceRESTEndpoints<E> =
  E extends ResourceEndpoints<
    EndpointInstance<infer G>,
    EndpointInstance<infer L>,
    EndpointInstance<infer C>,
    EndpointInstance<infer E>,
    EndpointInstance<infer D>,
    infer CC
  >
    ? EndpointREST<
        EndpointInstance<G>,
        EndpointInstance<L>,
        EndpointInstance<C>,
        EndpointInstance<E>,
        EndpointInstance<D>,
        CC
      >
    : never;

export interface EndpointsRESTClient<ES extends EndpointsMapType> {
  Endpoints: {
    [K in keyof ES]: ResourceRESTEndpoints<ES[K]>;
  };
  client: APIRESTClient;
}
