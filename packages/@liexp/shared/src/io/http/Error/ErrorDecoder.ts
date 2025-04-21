import { fp } from "@liexp/core/lib/fp/index.js";
import { Schema } from "effect";
import { type ParseError } from "effect/ParseResult";
import { type Either } from "fp-ts/lib/Either.js";
import { CoreError } from "./CoreError.js";

const decode = (e: unknown): Either<ParseError, CoreError> => {
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

  if (Schema.is(CoreError)(e)) {
    return fp.E.right(e);
  }

  // decode the value with schema
  return Schema.decodeUnknownEither(CoreError)(e);
};

export const ErrorDecoder = {
  decode,
};
