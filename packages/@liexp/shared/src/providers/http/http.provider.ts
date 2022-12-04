import { GetLogger } from "@liexp/core/logger";
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import * as E from "fp-ts/Either";
import { flow, pipe } from "fp-ts/function";
import * as TE from "fp-ts/TaskEither";
import * as t from "io-ts";
import { PathReporter } from "io-ts/lib/PathReporter";
import { MinimalEndpointInstance, TypeOfEndpointInstance } from "ts-endpoint";

const apiLogger = GetLogger("http");

export class APIError extends Error {
  details: string[];
  constructor(message: string, details: string[]) {
    super(message);
    this.details = details;
  }
}

export const toAPIError = (e: unknown): APIError => {
  // eslint-disable-next-line
  apiLogger.error.log("An error occurred %O", e);
  if (e instanceof Error) {
    return new APIError(e.message, []);
  }

  return new APIError("An error occurred", []);
};

export const fromValidationErrors = flow(
  E.mapLeft((e: t.Errors): APIError => {
    return new APIError("Validation failed.", PathReporter.report(E.left(e)));
  })
);

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

type HTTP = {
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

const HTTP = (c: AxiosRequestConfig): HTTP => {
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

  return {
    get,
    put,
    post,
  };
};

export { HTTP };
