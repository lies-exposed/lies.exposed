import { type FSError } from "@liexp/backend/lib/providers/fs/fs.provider.js";
import { JWTError } from "@liexp/backend/lib/providers/jwt/jwt.provider.js";
import { type NERError } from "@liexp/backend/lib/providers/ner/ner.provider.js";
import { DBError } from "@liexp/backend/lib/providers/orm/index.js";
import { type SpaceError } from "@liexp/backend/lib/providers/space/space.provider.js";
import {
  APIError,
  decodeIOErrorDetails,
  fromIOError,
  type APIStatusCode,
} from "@liexp/shared/lib/io/http/Error/APIError.js";
import { DecodeError } from "@liexp/shared/lib/io/http/Error/DecodeError.js";
import { type HTTPError } from "@liexp/shared/lib/providers/http/http.provider.js";
import { UnauthorizedError } from "express-jwt";
import * as t from "io-ts";
import { failure } from "io-ts/lib/PathReporter.js";
import { IOError } from "ts-io-error";

class BadRequestError extends IOError {
  name = "BadRequestError";
}

export const toBadRequestError = (meta: string): ControllerError =>
  new BadRequestError("Bad Request", {
    kind: "ClientError",
    status: "400",
    meta,
  });

class NotFoundError extends IOError {
  name = "NotFoundError";
}

export const toNotFoundError = (entityName: string): ControllerError =>
  new NotFoundError(`Can't find resource ${entityName}`, {
    kind: "ServerError",
    status: "404",
  });

export class ServerError extends IOError {
  name = "ServerError";

  static of(meta?: string[]): ServerError {
    return new ServerError("Server Error", {
      kind: "ServerError",
      status: "500",
      meta,
    });
  }
}

class NotAuthorizedError extends IOError {
  name = "NotAuthorizedError";
}
export const toNotAuthorizedError = (): ControllerError => {
  return new NotAuthorizedError(
    "Authorization header [Authorization] is missing",
    {
      kind: "ClientError",
      status: "401",
    },
  );
};

export type ControllerError =
  | HTTPError
  | JWTError
  | DBError
  | SpaceError
  | FSError
  | NERError
  | BadRequestError
  | NotFoundError
  | ServerError
  | NotAuthorizedError
  | DecodeError
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
  const parsedError = !err.details
    ? []
    : t.array(t.string).is(err.details)
      ? err.details
      : decodeIOErrorDetails(err.details);

  return `[${err.name}] ${err.message}:\n${parsedError}`;
};

export const toAPIError = (err: ControllerError): APIError => {
  if (err instanceof UnauthorizedError) {
    return {
      ...err,
      name: "APIError",
      status: 401 as APIStatusCode,
      details: [],
    };
  }

  if (err instanceof Error) {
    if (err.name === NotAuthorizedError.name) {
      return {
        status: 401,
        name: "APIError",
        message: err.message,
        details: [...err.details.kind],
      };
    }

    if (err.name === JWTError.name) {
      return {
        status: 401,
        name: "APIError",
        message: err.message,
        details: (err.details as any).meta,
      };
    }

    if (err.name === NotFoundError.name) {
      return {
        status: 404,
        name: "APIError",
        message: err.message,
        details: [...err.details.kind],
      };
    }

    if (err.details.kind === "DecodingError") {
      return {
        status: 400,
        name: "APIError",
        message: err.message,
        details: failure((err.details as any).errors),
      };
    }

    if (err.name === DecodeError.name) {
      return {
        status: 400,
        name: "APIError",
        message: err.message,
        details: failure((err.details as any).errors),
      };
    }

    if (err.name === DBError.name) {
      return {
        status: 500,
        name: "APIError",
        message: err.message,
        details: [...err.details.kind],
      };
    }

    if (err.name === BadRequestError.name) {
      const e = err as BadRequestError;
      return {
        status: 400,
        name: "APIError",
        message: err.message,
        details: [e.details.kind],
      };
    }
  }

  if (APIError.is(err)) {
    return err;
  }

  if (err instanceof IOError) {
    return fromIOError(err);
  }

  // eslint-disable-next-line no-console
  console.log("unknown error", err);
  // eslint-disable-next-line no-console
  console.dir(err);

  return {
    status: 500,
    name: "APIError",
    message: "Unknown error",
    details: ["Unknown error"],
  };
};

export default { report, toControllerError };
