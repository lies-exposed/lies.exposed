import { GetLogger } from "@liexp/core/lib/logger/index.js";
import { type AxiosInstance, type AxiosResponse } from "axios";
import * as A from "fp-ts/lib/Array.js";
import * as R from "fp-ts/lib/Record.js";
import type * as TE from "fp-ts/lib/TaskEither.js";
import { pipe } from "fp-ts/lib/function.js";
import {
  type MinimalEndpointInstance,
  type TypeOfEndpointInstance,
} from "ts-endpoint";
import { Endpoints } from "../../endpoints/index.js";
import { type ResourceEndpoints } from "../../endpoints/types.js";
import { type APIError } from "../../io/http/Error/APIError.js";
import { type HTTPProvider, liftFetch } from "../http/http.provider.js";

const apiLogger = GetLogger("API");

export type TERequest<E extends MinimalEndpointInstance> = (
  input: TypeOfEndpointInstance<E>["Input"],
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
        List: TERequest<List>;
        Get: TERequest<Get>;
        Custom: CC extends Record<string, MinimalEndpointInstance>
          ? {
              [K in keyof CC]: TERequest<CC[K]>;
            }
          : // eslint-disable-next-line @typescript-eslint/ban-types
            {};
      }
    : never;
} & HTTPProvider;

const API = (client: AxiosInstance): API => {
  const toTERequest = <E extends MinimalEndpointInstance>(
    e: E,
  ): TERequest<E> => {
    return (b: TypeOfEndpointInstance<E>["Input"]) => {
      const url = e.getPath(b?.Params);
      return pipe(
        liftFetch<TypeOfEndpointInstance<E>["Output"]>(() => {
          apiLogger.debug.log("%s %s req: %O", e.Method, url, b);

          return client.request<
            TypeOfEndpointInstance<E>["Input"],
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
        }, e.Output.decode),
        apiLogger.debug.logInTaskEither(`${e.Method} ${url} res: %O`),
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
          // eslint-disable-next-line @typescript-eslint/ban-types
          Record<string, MinimalEndpointInstance>
        >,
      ],
      API
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
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
