import type * as io from "@liexp/shared/lib/io/index.js";
import * as E from "fp-ts/lib/Either.js";
import * as t from "io-ts";
import { PathReporter } from "io-ts/lib/PathReporter.js";
import { type IOError } from "ts-shared/lib/errors.js";

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

export interface APIError extends io.http.Error.CoreError {
  status: t.TypeOf<typeof APIStatusCode>;
  message: string;
}

export const ServerError = (meta?: string[]): APIError => {
  return {
    name: "APIError",
    status: 500,
    message: "Server Error",
    details: meta,
  };
};

export const fromIOError = (e: IOError): APIError => {
  switch (e.details.kind) {
    case "DecodingError":
      return {
        status: 400,
        name: e.details.kind,
        message: e.details.kind,
        details: PathReporter.report(E.left(e.details.errors)),
      };
    default:
      return {
        status: ["ServerError", "NetworkError"].includes(e.details.kind)
          ? 500
          : (e.status as APIStatusCode),
        name: e.details.kind,
        message: "",
        details: e.details.meta as any,
      };
  }
};
