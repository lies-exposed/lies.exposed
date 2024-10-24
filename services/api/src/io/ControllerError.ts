import { type FSError } from "@liexp/backend/lib/providers/fs/fs.provider.js";
import { type JWTError } from "@liexp/backend/lib/providers/jwt/jwt.provider.js";
import { type NERError } from "@liexp/backend/lib/providers/ner/ner.provider.js";
import { DBError } from "@liexp/backend/lib/providers/orm/index.js";
import { type SpaceError } from "@liexp/backend/lib/providers/space/space.provider.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { APIError } from "@liexp/shared/lib/io/http/Error/APIError.js";
import { type _DecodeError } from "@liexp/shared/lib/io/http/Error/DecodeError.js";
import { ErrorDecoder } from "@liexp/shared/lib/io/http/Error/ErrorDecoder.js";
import { UnauthorizedError } from "express-jwt";
import { failure } from "io-ts/lib/PathReporter.js";
import { IOError } from "ts-shared/lib/errors.js";

class _BadRequestError extends IOError {
  name = "BadRequestError";
}

export const BadRequestError = (meta: string): ControllerError =>
  new _BadRequestError("Bad Request", {
    kind: "ClientError",
    status: "400",
    meta,
  });

class _NotFoundError extends IOError {
  name = "NotFoundError";
}

export const NotFoundError = (entityName: string): ControllerError =>
  new _NotFoundError(`Can't find resource ${entityName}`, {
    kind: "ServerError",
    status: "404",
  });

class _ServerError extends IOError {
  name = "ServerError";
}
export const ServerError = (meta?: string[]): ControllerError => {
  return new _ServerError("Server Error", {
    kind: "ServerError",
    status: "500",
    meta,
  });
};

class _NotAuthorizedError extends IOError {
  name = "NotAuthorizedError";
}
export const NotAuthorizedError = (): ControllerError => {
  return new _NotAuthorizedError(
    "Authorization header [Authorization] is missing",
    {
      kind: "ClientError",
      status: "401",
    },
  );
};

export type ControllerError =
  | JWTError
  | DBError
  | SpaceError
  | FSError
  | NERError
  | APIError
  | _BadRequestError
  | _NotFoundError
  | _ServerError
  | _NotAuthorizedError
  | _DecodeError
  | IOError;

export const toControllerError = (e: unknown): ControllerError => {
  if (e instanceof IOError) {
    return e;
  }

  if (e instanceof Error) {
    return new IOError(e.message, {
      kind: "ServerError",
      meta: [e.name, e.stack],
      status: "Unknown Error",
    });
  }

  // eslint-disable-next-line no-console
  console.error(e);

  return new IOError(`UnknownError: ${String(e)}`, {
    kind: "ServerError",
    status: "Unknown Error",
  });
};

export const report = (err: ControllerError): string => {
  const parsedError =
    err.details.kind === "DecodingError"
      ? err.details.errors
        ? failure(err.details.errors as any[])
        : []
      : ((err.details.meta as any[]) ?? []);

  return `${err.name}: ${err.details.kind} - ${parsedError}`;
};

export const toAPIError = (err: ControllerError): APIError => {
  console.log("toAPIError", err);
  console.dir(err);

  if (err instanceof UnauthorizedError) {
    return { ...err, name: "APIError", status: 401 };
  }

  if (err instanceof _NotAuthorizedError) {
    return {
      status: 401,
      name: "APIError",
      message: err.message,
      details: [...err.details.kind],
    };
  }

  if (err instanceof _NotFoundError) {
    return {
      status: 404,
      name: "APIError",
      message: err.message,
      details: [...err.details.kind],
    };
  }

  if (err instanceof DBError) {
    return {
      status: 500,
      name: "APIError",
      message: err.message,
      details: [...err.details.kind],
    };
  }

  if (err instanceof _BadRequestError) {
    return {
      status: 400,
      name: "APIError",
      message: err.message,
      details: [...err.details.kind],
    };
  }

  if (APIError.is(err)) {
    return err;
  }

  return pipe(
    fp.E.right<APIError, APIError>({
      ...err,
      status: 500,
      name: "APIError",
      details: ErrorDecoder.decodeIOErrorDetails(err.details),
    }),
    fp.E.fold(
      (e) => ({
        status: 500,
        name: "APIError",
        message: "Unknown error",
        details: ["Unknown error"],
      }),
      (e) => e,
    ),
  );
};

export default { report, toControllerError };
