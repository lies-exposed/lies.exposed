import * as E from "fp-ts/lib/Either";
import * as t from "io-ts";
import { PathReporter } from "io-ts/lib/PathReporter";
import { IOError } from "ts-shared/lib/errors";

export const APIStatusCode = t.union(
  [
    t.literal(200),
    t.literal(201),
    t.literal(400),
    t.literal(401),
    t.literal(404),
    t.literal(500),
  ],
  "StatusCode"
);

export type APIStatusCode = t.TypeOf<typeof APIStatusCode>;

export class ControllerError extends IOError {
  status: t.TypeOf<typeof APIStatusCode>;
}

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
    message: "Authorization header is missing",
    details: {
      kind: "ClientError",
      status: "401",
    },
  };
};

export const DecodeError = (errors: t.Errors): ControllerError => {
  // eslint-disable-next-line
  console.log(PathReporter.report(E.left(errors)));
  return {
    name: "APIError",
    status: 500,
    message: "Decode Error",
    details: {
      kind: "DecodingError",
      errors,
    },
  };
};
