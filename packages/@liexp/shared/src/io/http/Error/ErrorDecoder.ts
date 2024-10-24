import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type Either } from "fp-ts/lib/Either.js";
import type * as t from "io-ts";
import { type IOErrorDetails } from "ts-io-error";
import { decodeAPIError } from "./APIError.js";
import { type CoreError } from "./Error.js";

const decodeIOErrorDetails = (details: IOErrorDetails<any>): string[] => {
  return details.kind === "ServerError"
    ? (details.meta as string[])
    : details.kind === "DecodingError"
      ? (details.errors as string[])
      : [];
};

const decode = (e: unknown): Either<t.Errors, CoreError> => {
  // match the instance classes first
  if (e instanceof TypeError) {
    return fp.E.right({
      name: "TypeError",
      message: e.message,
      status: 500,
      details: e.stack?.split("\n"),
    });
  }

  if (e instanceof Error) {
    return fp.E.right({
      name: e.name,
      message: e.message,
      status: 500,
      details: e.stack?.split("\n"),
    });
  }

  // decode the value with schema
  return pipe(
    decodeAPIError(e),
    fp.E.map((e) => ({
      name: e.name,
      message: e.message,
      status: e.status,
      details: decodeIOErrorDetails(e.details),
    })),
  );
};

export const ErrorDecoder = {
  decode,
  decodeIOErrorDetails,
};
