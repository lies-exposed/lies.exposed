import { JWTError } from "@liexp/backend/lib/providers/jwt/jwt.provider.js";
import { DBError } from "@liexp/backend/lib/providers/orm/index.js";
import * as t from "io-ts";
import { failure } from "io-ts/lib/PathReporter.js";

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

export type ControllerError = DBError | JWTError;

export const BadRequestError = (meta: string): ControllerError => ({
  name: "BadRequestError",
  message: `Bad Request`,
  status: 400,
  details: {
    kind: "ClientError",
    status: "400",
    meta,
  },
});

export const NotFoundError = (entityName: string): ControllerError => ({
  name: "NotFoundError",
  message: `Can't find resource ${entityName}`,
  status: 404,
  details: {
    kind: "ClientError",
    status: "404",
  },
});

export const ServerError = (meta?: string[]): ControllerError => {
  return {
    name: "APIError",
    status: 500,
    message: "Server Error",
    details: {
      kind: "ServerError",
      status: "500",
      meta,
    },
  };
};

export const NotAuthorizedError = (): ControllerError => {
  return {
    name: "APIError",
    status: 401,
    message: "Authorization header [Authorization] is missing",
    details: {
      kind: "ClientError",
      status: "401",
    },
  };
};

export const DecodeError = (
  message: string,
  errors: t.Errors,
): ControllerError => {
  return {
    name: "APIError: Decode Error",
    status: 500,
    message,
    details: {
      kind: "DecodingError",
      errors: failure(errors),
    },
  };
};

export const toControllerError = (e: unknown): ControllerError => {
  // eslint-disable-next-line no-console
  console.error(e);
  if (e instanceof JWTError) {
    return e;
  }

  if (e instanceof DBError) {
    return e;
  }

  if (e instanceof Error) {
    return {
      name: e.name,
      status: 500,
      message: e.message,
      details: {
        kind: "ServerError",
        meta: e.stack,
        status: "Unknown Error",
      },
    };
  }

  return {
    name: "ControllerError",
    status: 500,
    message: "Unknown Error",
    details: {
      kind: "ServerError",
      meta: [],
      status: "Unknown Error",
    },
  };
};
