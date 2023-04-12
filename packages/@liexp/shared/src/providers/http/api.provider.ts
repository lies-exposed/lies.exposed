import { GetLogger } from "@liexp/core/lib/logger";
import axios, { type AxiosRequestConfig, type AxiosResponse } from "axios";
import * as A from "fp-ts/Array";
import * as R from "fp-ts/Record";
import type * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { type MinimalEndpointInstance, type TypeOfEndpointInstance } from "ts-endpoint";
import { Endpoints } from "../../endpoints";
import { type ResourceEndpoints } from "../../endpoints/types";
import { type APIError, HTTP, liftFetch } from "./http.provider";

const apiLogger = GetLogger("API");

export type TERequest<E extends MinimalEndpointInstance> = (
  input: TypeOfEndpointInstance<E>["Input"]
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
} & HTTP;

const API = (c: AxiosRequestConfig): API => {
  const client = axios.create(c);

  const http = HTTP(c);

  const toTERequest = <E extends MinimalEndpointInstance>(
    e: E
  ): TERequest<E> => {
    return (b: TypeOfEndpointInstance<E>["Input"]) =>
      liftFetch<TypeOfEndpointInstance<E>["Output"]>(() => {
        const url = e.getPath(b?.Params);
        apiLogger.debug.log("%s %s %O", e.Method, url, b);

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
      }, e.Output.decode);
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
          {}
        >
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
            R.map((ee: MinimalEndpointInstance) => toTERequest(ee))
          ),
        })
      ),
    }))
  );

  return {
    ...apiImpl,
    ...http,
  };
};

export { API };
