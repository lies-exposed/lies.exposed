import { GetLogger } from "@econnessione/core/logger";
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import * as A from "fp-ts/lib/Array";
import * as E from "fp-ts/lib/Either";
import * as R from "fp-ts/lib/Record";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import * as t from "io-ts";
import { PathReporter } from "io-ts/lib/PathReporter";
import {
  MinimalEndpoint,
  MinimalEndpointInstance,
  TypeOfEndpointInstance,
} from "ts-endpoint";
import { Endpoints } from "../endpoints";
import { ResourceEndpoints } from "../endpoints/types";
// import qs from "qs";

const apiLogger = GetLogger("API");

export class APIError extends Error {
  details: string[];
  constructor(message: string, details: string[]) {
    super(message);
    this.details = details;
  }
}

export const toAPIError = (e: unknown): APIError => {
  // eslint-disable-next-line
  apiLogger.error.log("An error occured %O", e);
  if (e instanceof Error) {
    return new APIError(e.message, []);
  }

  return new APIError("An error occured", []);
};

export const liftFetch = <B>(
  lp: () => Promise<AxiosResponse<B>>,
  decode: <A>(a: A) => E.Either<t.Errors, B>
): TE.TaskEither<APIError, B> => {
  return pipe(
    TE.tryCatch(lp, toAPIError),
    TE.map((d) => d.data),
    TE.chain((content) => {
      return pipe(
        decode(content),
        E.mapLeft((e): APIError => {
          return new APIError(
            "Validation failed.",
            PathReporter.report(E.left(e))
          );
        }),
        TE.fromEither
      );
    })
  );
};

export type TERequest<E extends MinimalEndpointInstance> = (
  input: TypeOfEndpointInstance<E>["Input"]
) => TE.TaskEither<APIError, TypeOfEndpointInstance<E>["Output"]>;

type API = {
  [K in keyof Endpoints]: Endpoints[K] extends ResourceEndpoints<
    any,
    any,
    any,
    any,
    any
  >
    ? {
        List: TERequest<Endpoints[K]["List"]>;
        Get: TERequest<Endpoints[K]["Get"]>;
        // [KK in keyof Endpoints[K]]: TERequest<Endpoints[K][KK]>;
      }
    : never;
} & {
  get: <T>(
    url: string,
    config?: AxiosRequestConfig<any>
  ) => TE.TaskEither<Error, T>;
  post: <T, R>(
    url: string,
    data?: T,
    config?: AxiosRequestConfig<T>
  ) => TE.TaskEither<Error, R>;
  put: <T, R>(
    url: string,
    data?: T,
    config?: AxiosRequestConfig<T>
  ) => TE.TaskEither<Error, R>;
};

const API = (c: AxiosRequestConfig): API => {
  const client = axios.create(c);

  const get = <T>(
    url: string,
    config?: AxiosRequestConfig<any>
  ): TE.TaskEither<Error, T> =>
    liftFetch(() => client.get(url, config), t.any.decode);

  const post = <T, R>(
    url: string,
    data?: T,
    config?: AxiosRequestConfig<T>
  ): TE.TaskEither<Error, R> =>
    liftFetch(() => client.post(url, data, config), t.any.decode);

  const put = <T, R>(
    url: string,
    data?: T,
    config?: AxiosRequestConfig<T>
  ): TE.TaskEither<Error, R> =>
    liftFetch(() => client.put(url, data, config), t.any.decode);

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
          // paramsSerializer: (params) => {
          //   const paramsString = qs.stringify(params, {
          //     arrayFormat: "brackets",
          //     arrayLimit: 0,
          //   });
          //   console.log({ params, paramsString });
          //   return paramsString;
          // },
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
          MinimalEndpoint,
          MinimalEndpoint,
          MinimalEndpoint,
          MinimalEndpoint,
          MinimalEndpoint
        >
      ],
      API
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    >({} as API, (q, [k, e]) => ({
      ...q,
      [k]: pipe(
        e,
        R.map((ee) => toTERequest(ee as any))
      ),
    }))
  );

  return {
    ...apiImpl,
    get,
    put,
    post,
  };
};

export { API };
