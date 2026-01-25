import { IOError } from "@ts-endpoint/core";
import { type ParseError } from "effect/ParseResult";

export class DecodeError extends IOError {
  name = "DecodeError";

  static of(message: string, errors: ParseError): DecodeError {
    return new DecodeError(message, {
      kind: "DecodingError",
      errors: [errors.message],
    });
  }
}
