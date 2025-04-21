import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type IOErrorDetails, type IOError } from "@ts-endpoint/core";
import { Schema } from "effect";
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

export const APIStatusCode = Schema.Union(
  Schema.Literal(200),
  Schema.Literal(201),
  Schema.Literal(400),
  Schema.Literal(401),
  Schema.Literal(404),
  Schema.Literal(500),
).annotations({
  title: "StatusCode",
});

export type APIStatusCode = typeof APIStatusCode.Type;

export const APIError = Schema.Struct({
  ...CoreError.fields,
  status: APIStatusCode,
  name: Schema.Literal("APIError"),
}).annotations({
  title: "APIError",
});

export type APIError = typeof APIError.Type;

export const fromIOError = (e: IOError): APIError => {
  switch (e.details.kind) {
    case "DecodingError":
      return {
        status: e.status as APIStatusCode,
        name: "APIError",
        message: e.message,
        details: e.details.errors as any[],
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

  if (Schema.is(APIError)(e)) {
    return e;
  }

  if (Schema.is(IOErrorSchema)(e)) {
    return fromIOError(e as IOError);
  }

  if (e instanceof Error) {
    return Schema.encodeSync(APIError)({
      message: e.message,
      name: "APIError",
      details: e.stack ? [e.stack] : JSON.stringify(e, null, 2).split("\n"),
      status: 500,
    });
  }

  return pipe(
    e,
    Schema.decodeUnknownEither(APIError),
    fp.E.getOrElse(() => {
      return Schema.encodeSync(APIError)({
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
    : Schema.is(Schema.Array(Schema.String))(details)
      ? details
      : decodeIOErrorDetails(details);

  return parsedError.join("\n");
};
