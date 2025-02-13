import {
  NotFoundError,
  ServerError,
  BadRequestError,
  NotAuthorizedError,
  IOError,
} from "@liexp/backend/lib/errors/index.js";
import { type FSError } from "@liexp/backend/lib/providers/fs/fs.provider.js";
import { JWTError } from "@liexp/backend/lib/providers/jwt/jwt.provider.js";
import { type NERError } from "@liexp/backend/lib/providers/ner/ner.provider.js";
import { DBError } from "@liexp/backend/lib/providers/orm/index.js";
import { RedisError } from "@liexp/backend/lib/providers/redis/redis.error.js";
import { SpaceError } from "@liexp/backend/lib/providers/space/space.provider.js";
import { fp } from "@liexp/core/lib/fp/index.js";
import {
  APIError,
  fromIOError,
  reportIOErrorDetails,
} from "@liexp/shared/lib/io/http/Error/APIError.js";
import { _DecodeError } from "@liexp/shared/lib/io/http/Error/DecodeError.js";
import { IOErrorSchema } from "@liexp/shared/lib/io/http/Error/IOError.js";
import { type HTTPError } from "@liexp/shared/lib/providers/http/http.provider.js";
import { UnauthorizedError } from "express-jwt";
import { pipe } from "fp-ts/lib/function.js";

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
  | _DecodeError
  | RedisError
  | IOError;

export const toControllerError = (e: unknown): ControllerError => {
  const isIOErrorSchema = pipe(
    e,
    IOErrorSchema.decode,
    (e) => {
      // console.log(PathReporter.report(e));
      return e;
    },
    fp.E.isRight,
  );

  if (isIOErrorSchema) {
    return e as ControllerError;
  }

  if (e instanceof Error) {
    if (e instanceof UnauthorizedError) {
      return new NotAuthorizedError(e.message, {
        kind: "ClientError",
        status: "401",
        meta: [e.stack],
      });
    }
  }

  // eslint-disable-next-line no-console
  console.error("error mapping unknown error to ControllerError", e);

  const anyE = e as any;
  return new IOError(anyE?.message ?? "Unknown Error", {
    kind: anyE.details?.kind ?? "ServerError",
    meta: [...(anyE.meta ?? []), anyE?.stack].filter(Boolean),
    status: anyE.status ?? "500",
  });
};

export const report = (err: ControllerError): string => {
  return `[${err.name}] ${err.message}:\n${reportIOErrorDetails(err.details)}`;
};

export const toAPIError = (err: ControllerError): APIError => {
  if (err instanceof Error) {
    if (err.name === NotAuthorizedError.name) {
      return {
        status: 401,
        name: "APIError",
        message: err.message,
        details: [],
      };
    }

    if (err.name === JWTError.name) {
      return {
        status: 401,
        name: "APIError",
        message: err.message,
        details: (err.details as any).meta ?? [],
      };
    }

    if (err.name === NotFoundError.name) {
      return {
        status: 404,
        name: "APIError",
        message: err.message,
        details: [],
      };
    }

    if (err.name === RedisError.name) {
      return {
        status: 500,
        name: "APIError",
        message: err.message,
        details: (err.details as any).meta ?? [],
      };
    }

    if (
      err.name === _DecodeError.name ||
      err.details?.kind === "DecodingError"
    ) {
      return {
        status: 400,
        name: "APIError",
        message: err.message,
        details: (err.details as any).errors,
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

    if (err.name === ServerError.name) {
      return {
        status: 500,
        name: "APIError",
        message: err.message,
        details: (err.details.meta as any) ?? [],
      };
    }

    if (err.name === BadRequestError.name) {
      return {
        status: 400,
        name: "APIError",
        message: err.message,
        details: (err.details.meta as any[]) ?? [],
      };
    }

    if (err.name === SpaceError.name) {
      return {
        status: 500,
        name: "APIError",
        message: err.message,
        details: [],
      };
    }
  }

  if (IOErrorSchema.is(err)) {
    return fromIOError(err);
  }

  if (APIError.is(err)) {
    return err;
  }

  // eslint-disable-next-line no-console
  console.log("unknown error", err);
  // eslint-disable-next-line no-console
  console.dir(err);

  return {
    status: 500,
    name: "APIError",
    message: (err as any).message ?? "Unknown error",
    details: [JSON.stringify(err)],
  };
};
