import { GetLogger } from "@liexp/core/lib/logger/index.js";
import { type AxiosInstance, type AxiosResponse } from "axios";
import { Schema } from "effect";
import * as A from "fp-ts/lib/Array.js";
import * as R from "fp-ts/lib/Record.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { pipe } from "fp-ts/lib/function.js";
import {
  type MinimalEndpointInstance,
  type TypeOfEndpointInstance,
  type EndpointInstanceEncodedInputs,
} from "ts-endpoint";
import { Endpoints } from "../../endpoints/index.js";
import { type ResourceEndpoints } from "../../endpoints/types.js";
import { toAPIError, type APIError } from "../../io/http/Error/APIError.js";
import { liftFetch, type HTTPProvider } from "../http/http.provider.js";

const apiLogger = GetLogger("API");

export type TERequest<E extends MinimalEndpointInstance> = (
  input: EndpointInstanceEncodedInputs<E>,
) => TE.TaskEither<APIError, TypeOfEndpointInstance<E>["Output"]>;

type API = {
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
              [K in keyof CC]: TERequest<CC[K]>;
            }
          : object;
      }
    : never;
} & HTTPProvider;

const API = (client: AxiosInstance): API => {
  const toTERequest = <E extends MinimalEndpointInstance>(
    e: E,
  ): TERequest<E> => {
    return (b: EndpointInstanceEncodedInputs<E>) => {
      const url = e.getPath(b?.Params);
      return pipe(
        liftFetch<TypeOfEndpointInstance<E>["Output"]>(
          () => {
            apiLogger.debug.log("%s %s req: %O", e.Method, url, b);

            return client.request<
              EndpointInstanceEncodedInputs<E>,
              AxiosResponse<TypeOfEndpointInstance<E>["Output"]>
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
          Schema.decodeUnknownEither(e.Output as Schema.Schema<any>),
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
    >({} as API, (q, [k, { Custom, ...e }]) => ({
      ...q,
      [k]: pipe(
        e,
        R.map((ee: MinimalEndpointInstance) => toTERequest(ee)),
        (ends) => ({
          ...ends,
          Custom: pipe(
            Custom,
            R.map((ee: MinimalEndpointInstance) => toTERequest(ee)),
          ),
        }),
      ),
    })),
  );

  return apiImpl;
};

export { API };
