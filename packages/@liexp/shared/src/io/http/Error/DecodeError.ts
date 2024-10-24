import type * as t from "io-ts";
import { IOError } from "ts-io-error";

export class _DecodeError extends IOError {
  name = "DecodeError";
}

export const DecodeError = (message: string, errors: t.Errors): IOError => {
  return new _DecodeError(message, {
    kind: "DecodingError",
    errors,
  });
};
