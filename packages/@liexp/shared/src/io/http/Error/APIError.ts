import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type Either } from "fp-ts/lib/Either.js";
import * as t from "io-ts";
import { IOError } from "ts-io-error/lib/index.js";
import { CoreError } from "./Error.js";

export class APIError extends IOError {
  name = "APIError";
}

export const toAPIError = (e: unknown): APIError => {
  if (e instanceof APIError) {
    return e;
  }

  if (e instanceof IOError) {
    return e as APIError;
  }

  if (e instanceof Error) {
    return new APIError(e.message, {
      kind: "ServerError",
      meta: e,
      status: "500",
    });
  }

  return new APIError("An error occurred", {
    kind: "ServerError",
    meta: [JSON.stringify(e)],
    status: "500",
  });
};

const { details, ...baseCoreProps } = CoreError.type.props;

const APIErrorSchema = t.strict(
  {
    ...baseCoreProps,
    name: t.literal("APIError"),
    details: t.union([
      t.type({ kind: t.literal("DecodingError"), errors: t.array(t.unknown) }),
      t.type({
        kind: t.literal("CommunicationError"),
        meta: t.union([t.unknown, t.undefined]),
        status: t.string,
      }),
    ]),
  },
  "APIError",
);

export const decodeAPIError = (e: unknown): Either<t.Errors, APIError> => {
  // match the instance classes first
  if (e instanceof APIError) {
    return fp.E.right(e);
  }

  // decode the value with schema
  return pipe(
    APIErrorSchema.decode(e),
    fp.E.map((v) => v as APIError),
  );
};
