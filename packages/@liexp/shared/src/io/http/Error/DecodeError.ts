import { IOError } from "@ts-endpoint/core";
import { type ParseError } from "effect/ParseResult";

export class _DecodeError extends IOError {
  status: number = 400;
}

export const DecodeError = {
  of: (message: string, errors: ParseError): _DecodeError => {
    return new _DecodeError(message, {
      kind: "DecodingError",
      errors: [errors.message],
    });
  },
};
