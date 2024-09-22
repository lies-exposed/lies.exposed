import { flow, pipe } from "@liexp/core/lib/fp/index.js";
import {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
} from "axios";
import * as E from "fp-ts/lib/Either.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import * as t from "io-ts";
import { PathReporter } from "io-ts/lib/PathReporter.js";
import { APIError, toAPIError } from "../../io/http/Error/APIError.js";

export const fromValidationErrors = flow(
  E.mapLeft((e: t.Errors): APIError => {
    return new APIError("Validation failed.", {
      kind: "DecodingError",
      errors: PathReporter.report(E.left(e)),
    });
  }),
);

export const liftFetch = <B>(
  lp: () => Promise<AxiosResponse<B>>,
  decode: <A>(a: A) => E.Either<t.Errors, B>,
): TE.TaskEither<APIError, B> => {
  return pipe(
    TE.tryCatch(lp, toAPIError),
    TE.map((d) => d.data),
    TE.chain((content) => {
      return pipe(decode(content), fromValidationErrors, TE.fromEither);
    }),
  );
};

interface HTTPProvider {
  get: <T>(url: string, config?: AxiosRequestConfig) => TE.TaskEither<Error, T>;
  post: <T, R>(
    url: string,
    data?: T,
    config?: AxiosRequestConfig<T>,
  ) => TE.TaskEither<Error, R>;
  put: <T, R>(
    url: string,
    data?: T,
    config?: AxiosRequestConfig<T>,
  ) => TE.TaskEither<Error, R>;
}

const HTTPProvider = (client: AxiosInstance): HTTPProvider => {
  const get = <T>(
    url: string,
    config?: AxiosRequestConfig<any>,
  ): TE.TaskEither<Error, T> =>
    liftFetch(() => client.get(url, config), t.any.decode);

  const post = <T, R>(
    url: string,
    data?: T,
    config?: AxiosRequestConfig<T>,
  ): TE.TaskEither<Error, R> =>
    liftFetch(() => client.post(url, data, config), t.any.decode);

  const put = <T, R>(
    url: string,
    data?: T,
    config?: AxiosRequestConfig<T>,
  ): TE.TaskEither<Error, R> =>
    liftFetch(() => client.put(url, data, config), t.any.decode);

  return {
    get,
    put,
    post,
  };
};

export { HTTPProvider };
