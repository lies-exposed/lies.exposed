import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type Either } from "fp-ts/lib/Either.js";
import * as t from "io-ts";
import { IOError } from "ts-io-error/lib/index.js";
import { CoreError } from "./Error.js";

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
    // details: t.union([
    //   t.type({ kind: t.literal("DecodingError"), errors: t.array(t.unknown) }),
    //   t.type({
    //     kind: t.literal("CommunicationError"),
    //     meta: t.union([t.unknown, t.undefined]),
    //     status: t.string,
    //   }),
    //   t.type({
    //     kind: t.literal("ClientError"),
    //     status: t.string,
    //     meta: t.union([t.unknown, t.undefined]),
    //   }),
    // ]),
  },
  "APIError",
);

export type APIError = t.TypeOf<typeof APIError>;

export const toAPIError = (e: unknown): APIError => {
  console.log("to api error", e);
  console.dir(e);

  if (APIError.is(e)) {
    return e;
  }

  if (e instanceof IOError) {
    return e as APIError;
  }

  return pipe(
    decodeAPIError(e),
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

export const decodeAPIError = (e: unknown): Either<t.Errors, APIError> => {
  // match the instance classes first
  if (APIError.is(e)) {
    return fp.E.right(e);
  }

  // decode the value with schema
  return APIError.decode(e);
};
