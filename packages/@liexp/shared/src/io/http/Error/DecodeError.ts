import type * as t from "io-ts";
import { IOError } from "ts-io-error";

export class _DecodeError extends IOError {
  status: number = 400;
}

export const DecodeError = {
  of: (message: string, errors: t.Errors): _DecodeError => {
    return new _DecodeError(message, {
      kind: "DecodingError",
      errors: errors,
    });
  },
};
