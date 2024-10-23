import { fp } from "@liexp/core/lib/fp/index.js";
import { type Either } from "fp-ts/lib/Either.js";
import type * as t from "io-ts";
import { CoreError } from "./CoreError.js";

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

  if (CoreError.is(e)) {
    return fp.E.right(e);
  }

  // decode the value with schema
  return CoreError.decode(e);
};

export const ErrorDecoder = {
  decode,
};
