import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import * as E from "fp-ts/lib/Either.js";
import * as t from "io-ts";
import { PathReporter } from "io-ts/lib/PathReporter.js";
import { type IOErrorDetails } from "ts-io-error";
import { type IOError } from "ts-io-error/lib/index.js";
import { CoreError } from "./CoreError.js";
import { IOErrorSchema } from "./IOError.js";

export const decodeIOErrorDetails = (
  details: IOErrorDetails<any>,
): string[] => {
  return details.kind === "ServerError"
    ? (details.meta as string[])
    : details.kind === "DecodingError"
      ? (details.errors as string[])
      : [];
};

// class APIErrorClass extends IOError {
//   name = "APIError";
// }

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

export const APIError = t.strict(
  {
    ...CoreError.type.props,
    status: APIStatusCode,
    name: t.literal("APIError"),
  },
  "APIError",
);

export type APIError = t.TypeOf<typeof APIError>;

export const fromIOError = (e: IOError): APIError => {
  switch (e.details.kind) {
    case "DecodingError":
      return {
        status: e.status as APIStatusCode,
        name: "APIError",
        message: e.message,
        details: PathReporter.report(E.left(e.details.errors as any[])),
      };
    case "ClientError": {
      return {
        status: e.status as APIStatusCode,
        name: "APIError",
        message: e.message,
        details: e.details.meta as any,
      };
    }
    default:
      return {
        status: ["ServerError", "NetworkError"].includes(e.details.kind)
          ? 500
          : (e.status as APIStatusCode),
        name: "APIError",
        message: e.message,
        details: e.details.meta as any,
      };
  }
};

export const toAPIError = (e: unknown): APIError => {
  // console.log("to api error", e);
  // console.dir(e);

  if (APIError.is(e)) {
    return e;
  }

  if (IOErrorSchema.is(e)) {
    return fromIOError(e as IOError);
  }

  return pipe(
    APIError.decode(e),
    fp.E.getOrElse(() => {
      return APIError.encode({
        message: "An error occurred",
        name: "APIError",
        details: [JSON.stringify(e)],
        status: 500,
      });
    }),
  );
};

export const reportIOErrorDetails = (details: IOErrorDetails<any>): string => {
  const parsedError = !details
    ? []
    : t.array(t.string).is(details)
      ? details
      : decodeIOErrorDetails(details);

  return parsedError.join("\n");
};
