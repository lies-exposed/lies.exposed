import { flow, pipe } from "@liexp/core/lib/fp/index.js";
import {
  isAxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
} from "axios";
import * as E from "fp-ts/lib/Either.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import * as t from "io-ts";
import { PathReporter } from "io-ts/lib/PathReporter.js";
import { IOError } from "ts-io-error";

export class HTTPError extends IOError {
  name = "HTTPError";
}

export const toHTTPError = (e: unknown): HTTPError => {
  if (isAxiosError(e)) {
    return new HTTPError(e.message, {
      kind: "ClientError",
      status: `${e.response?.status ?? 500}`,
      meta: [e.stack, e.cause?.message],
    });
  }

  if (e instanceof Error) {
    return new HTTPError(e.message, {
      kind: "ClientError",
      status: "500",
      meta: [e.stack ?? ""],
    });
  }

  return new HTTPError("Unknown error", {
    kind: "ClientError",
    status: "500",
    meta: [JSON.stringify(e)],
  });
};

export const fromValidationErrors = flow(
  E.mapLeft((e: t.Errors): HTTPError => {
    return new HTTPError("Validation failed.", {
      kind: "DecodingError",
      errors: PathReporter.report(E.left(e)),
    });
  }),
);

export const liftFetch = <B>(
  lp: () => Promise<AxiosResponse<B>>,
  decode: <A>(a: A) => E.Either<t.Errors, B>,
): TE.TaskEither<HTTPError, B> => {
  return pipe(
    TE.tryCatch(lp, toHTTPError),
    TE.map((d) => d.data),
    TE.chain((content) => {
      return pipe(decode(content), fromValidationErrors, TE.fromEither);
    }),
  );
};

interface HTTPProvider {
  get: <T>(
    url: string,
    config?: AxiosRequestConfig,
  ) => TE.TaskEither<HTTPError, T>;
  post: <T, R>(
    url: string,
    data?: T,
    config?: AxiosRequestConfig<T>,
  ) => TE.TaskEither<HTTPError, R>;
  put: <T, R>(
    url: string,
    data?: T,
    config?: AxiosRequestConfig<T>,
  ) => TE.TaskEither<HTTPError, R>;
}

const HTTPProvider = (client: AxiosInstance): HTTPProvider => {
  const get = <T>(
    url: string,
    config?: AxiosRequestConfig<any>,
  ): TE.TaskEither<HTTPError, T> =>
    liftFetch(() => client.get(url, config), t.any.decode);

  const post = <T, R>(
    url: string,
    data?: T,
    config?: AxiosRequestConfig<T>,
  ): TE.TaskEither<HTTPError, R> =>
    liftFetch(() => client.post(url, data, config), t.any.decode);

  const put = <T, R>(
    url: string,
    data?: T,
    config?: AxiosRequestConfig<T>,
  ): TE.TaskEither<HTTPError, R> =>
    liftFetch(() => client.put(url, data, config), t.any.decode);

  return {
    get,
    put,
    post,
  };
};

export { HTTPProvider };
