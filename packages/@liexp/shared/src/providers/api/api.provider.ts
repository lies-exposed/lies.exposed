import { GetLogger } from "@liexp/core/lib/logger/index.js";
import { type AxiosInstance, type AxiosResponse } from "axios";
import { Schema } from "effect";
import * as A from "fp-ts/lib/Array.js";
import * as R from "fp-ts/lib/Record.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { pipe } from "fp-ts/lib/function.js";
import {
  type EndpointInstance,
  type MinimalEndpointInstance,
  type ResourceEndpoints,
  type TypeOfEndpointInstanceInput,
} from "ts-endpoint";
import { type runtimeType, type serializedType } from "ts-io-error";
import { Endpoints } from "../../endpoints/index.js";
import { toAPIError, type APIError } from "../../io/http/Error/APIError.js";
import { liftFetch, type HTTPProvider } from "../http/http.provider.js";

const apiLogger = GetLogger("API");

export type TERequest<E extends MinimalEndpointInstance> = (
  input: TypeOfEndpointInstanceInput<E>,
) => TE.TaskEither<APIError, runtimeType<E["Output"]>>;

export type API = {
  [K in keyof Endpoints]: Endpoints[K] extends ResourceEndpoints<
    infer Get,
    infer List,
    any,
    any,
    any,
    infer CC
  >
    ? {
        Get: TERequest<Get>;
        List: TERequest<List>;
        Custom: CC extends Record<string, MinimalEndpointInstance>
          ? {
              [K in keyof CC]: CC[K] extends EndpointInstance<infer E>
                ? TERequest<EndpointInstance<E>>
                : never;
            }
          : object;
      }
    : never;
} & HTTPProvider;

export const toTERequest =
  <E extends MinimalEndpointInstance>(e: E) =>
  (client: AxiosInstance): TERequest<E> => {
    return (b: TypeOfEndpointInstanceInput<E>) => {
      const url = e.getPath(b?.Params);
      return pipe(
        liftFetch<serializedType<E["Output"]>, runtimeType<E["Output"]>>(
          () => {
            apiLogger.debug.log("%s %s req: %O", e.Method, url, b);

            return client.request<
              TypeOfEndpointInstanceInput<E>,
              AxiosResponse<serializedType<E["Output"]>>
            >({
              method: e.Method,
              url,
              params: b?.Query,
              data: b?.Body,
              responseType: "json",
              headers: {
                Accept: "application/json",
              },
            });
          },
          Schema.encodeUnknownEither(
            e.Output as Schema.Schema<any, runtimeType<E["Output"]>>,
          ),
        ),
        TE.mapLeft((err) => {
          const apiError = toAPIError(err);
          apiLogger.error.log(`${e.Method} ${url} error: %O`, apiError);
          return apiError;
        }),
        TE.chainFirst(() =>
          TE.fromIO(() => apiLogger.debug.log(`${e.Method} ${url} res: %O`)),
        ),
      );
    };
  };

const GetAPIProvider = (client: AxiosInstance): API => {
  const apiImpl = pipe(
    R.toArray(Endpoints),
    A.reduce<
      [
        keyof Endpoints,
        ResourceEndpoints<
          MinimalEndpointInstance,
          MinimalEndpointInstance,
          MinimalEndpointInstance,
          MinimalEndpointInstance,
          MinimalEndpointInstance,
          Record<string, MinimalEndpointInstance>
        >,
      ],
      API
    >(
      {} as API,
      (q, [k, { Custom, ...e }]) =>
        ({
          ...q,
          [k]: pipe(
            e,
            R.map((ee: MinimalEndpointInstance) => toTERequest(ee)(client)),
            (ends) => ({
              ...ends,
              Custom: pipe(
                Custom,
                R.map((ee: MinimalEndpointInstance) => toTERequest(ee)(client)),
              ),
            }),
          ),
        }) as API,
    ),
  );

  return apiImpl;
};

export { GetAPIProvider };
