import { type FSError } from "@liexp/backend/lib/providers/fs/fs.provider.js";
import { type JWTError } from "@liexp/backend/lib/providers/jwt/jwt.provider.js";
import { type NERError } from "@liexp/backend/lib/providers/ner/ner.provider.js";
import { type DBError } from "@liexp/backend/lib/providers/orm/index.js";
import { type SpaceError } from "@liexp/backend/lib/providers/space/space.provider.js";
import { type APIError } from "@liexp/shared/lib/io/http/Error/APIError.js";
import { type _DecodeError } from "@liexp/shared/lib/io/http/Error/DecodeError.js";
import * as t from "io-ts";
import { failure } from "io-ts/lib/PathReporter.js";
import { IOError } from "ts-shared/lib/errors.js";

export const APIStatusCode = t.union(
  [
    t.literal(200),
    t.literal(201),
    t.literal(400),
    t.literal(401),
    t.literal(404),
    t.literal(500),
  ],
  "StatusCode",
);

export type APIStatusCode = t.TypeOf<typeof APIStatusCode>;

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

export default { report, toControllerError };
