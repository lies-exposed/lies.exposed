import { GetLogger } from "@liexp/core/lib/logger/index.js";
import { isAxiosError } from "axios";
import * as A from "fp-ts/lib/Array.js";
import type * as E from "fp-ts/lib/Either.js";
import * as R from "fp-ts/lib/Record.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { pipe } from "fp-ts/lib/function.js";
import type * as t from "io-ts";
// eslint-disable-next-line no-restricted-imports
import type { CreateParams, GetListResult, GetOneResult } from "react-admin";
import {
  type InferEndpointInstanceParams,
  type EndpointInstance,
  type InferEndpointParams,
  type MinimalEndpoint,
  type MinimalEndpointInstance,
  type TypeOfEndpointInstance,
} from "ts-endpoint";
import {
  type runtimeType,
  type serializedType,
} from "ts-io-error/lib/Codec.js";
import { type EndpointsMapType } from "../../endpoints/Endpoints.js";
import { type ResourceEndpoints } from "../../endpoints/types.js";
import { APIError, toAPIError } from "../../io/http/Error/APIError.js";
import { type APIRESTClient } from "../../providers/api-rest.provider.js";
import { fromValidationErrors } from "../../providers/http/http.provider.js";
import {
  type CustomEndpointFn,
  type CustomEndpointsRecord,
  type EndpointOutput,
  type EndpointREST,
  type EndpointsRESTClient,
} from "./types.js";

const toError = (e: unknown): APIError => {
  if (isAxiosError(e)) {
    if (APIError.is(e.response?.data)) {
      return e.response?.data;
    }

    return toAPIError(e.response?.data ?? e.cause);
  }
  return toAPIError(e);
};

export const dataProviderRequestLift = <B extends { data: any }>(
  lp: () => Promise<GetOneResult<any>> | Promise<GetListResult<any>>,
  decode: <A>(a: A) => E.Either<t.Errors, B>,
): TE.TaskEither<APIError, B> => {
  return pipe(
    TE.tryCatch(lp, toError),
    TE.chain((content) => {
      return pipe(
        decode(content),
        fromValidationErrors,
        TE.fromEither,
        TE.mapLeft(toAPIError),
      );
    }),
  );
};

const restFromResourceEndpoints = <
  G extends MinimalEndpoint,
  L extends MinimalEndpoint,
  C extends MinimalEndpoint,
  E extends MinimalEndpoint,
  D extends MinimalEndpoint,
  CC extends Record<string, MinimalEndpointInstance>,
>(
  apiClient: APIRESTClient,
  e: ResourceEndpoints<
    EndpointInstance<G>,
    EndpointInstance<L>,
    EndpointInstance<C>,
    EndpointInstance<E>,
    EndpointInstance<D>,
    CC
  >,
): EndpointREST<G, L, C, E, D, CC> => {
  const log = GetLogger("endpoints-rest-client");
  return {
    get: (params, query) => {
      const url = e.Get.getPath(params);
      log.debug.log("GET %s: %j", url, params);
      const getParams = { ...(params ?? {}), ...(query ?? {}) };
      return pipe(
        dataProviderRequestLift(
          () =>
            apiClient.get<
              serializedType<InferEndpointParams<G>["output"]> & {
                id: string;
              }
            >(url, getParams),
          e.Get.Output.decode,
        ),
        TE.map((r) => r.data),
      );
    },
    getList: (params) => {
      log.debug.log("GET %s: %j", e.List.getPath(), params);
      return pipe(
        dataProviderRequestLift(
          () =>
            apiClient.getList<{
              id: string;
            }>(e.List.getPath(params), params),
          e.List.Output.decode,
        ),
      );
    },
    post: (params) => {
      log.debug.log("POST %s: %j", e.Create.getPath(params), params);
      return pipe(
        dataProviderRequestLift(
          () =>
            apiClient.create<
              runtimeType<InferEndpointInstanceParams<C>["output"]> & {
                id: string;
              }
            >(e.Create.getPath(params), { data: params } as CreateParams),
          e.Create.Output.decode,
        ),
        TE.map((r) => r.data),
      );
    },
    edit: (params) => {
      log.debug.log("PUT %s: %j", e.Edit.getPath(params), params);
      return pipe(
        dataProviderRequestLift(
          () =>
            apiClient.put<
              runtimeType<InferEndpointInstanceParams<E>["output"]>
            >(e.Edit.getPath(params), params),
          e.Edit.Output.decode,
        ),
        TE.map((r) => r.data),
      );
    },
    delete: (params) => {
      return pipe(
        dataProviderRequestLift(
          () => apiClient.delete(e.Delete.getPath(params), params),
          e.Delete.Output.decode,
        ),
      );
    },
    Custom: pipe(
      e.Custom,
      R.mapWithIndex((key, ee) => {
        const fetch = (
          params: TypeOfEndpointInstance<typeof ee>["Input"],
        ): TE.TaskEither<APIError, EndpointOutput<typeof ee>> => {
          const url = ee.getPath((params as any).Params);

          log.debug.log("(custom) %s %s: %j", ee.Method, url, params);

          return dataProviderRequestLift(
            () =>
              apiClient.request({
                method: ee.Method,
                url,
                params: (params as any).Query,
                data: (params as any).Body,
                responseType: "json",
                headers: {
                  Accept: "application/json",
                  ...(params as any).Headers,
                },
              }),
            ee.Output.decode,
          );
        };

        const customFetch: CustomEndpointFn<typeof ee> = (params, q) => {
          const p: any = params;
          const payload: any = {
            ...(p?.Params ? { Params: p.Params } : {}),
            ...(p?.Query ? { Query: { ...p.Query, ...(q ?? {}) } } : {}),
            ...(p?.Headers ? { Headers: p.Headers } : {}),
            ...(p?.Body ? { Body: p.Body } : {}),
          };
          // console.log("payload", payload);
          return pipe(fetch(payload));
        };

        return customFetch;
      }),
    ) as CustomEndpointsRecord<CC>,
  };
};

const fromEndpoints =
  (apiClient: APIRESTClient) =>
  <ES extends EndpointsMapType>(Endpoints: ES): EndpointsRESTClient<ES> => {
    const endpoints = pipe(
      Endpoints,
      R.toArray,
      A.reduce({}, (q, [k, e]) => ({
        ...q,
        [k]: restFromResourceEndpoints(apiClient, e as any),
      })),
    ) as EndpointsRESTClient<ES>["Endpoints"];

    return {
      Endpoints: endpoints,
      client: apiClient,
    };
  };

export { fromEndpoints };
