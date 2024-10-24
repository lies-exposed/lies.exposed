import type * as t from "io-ts";
import { IOError } from "ts-io-error";

export class DecodeError extends IOError {
  status: number = 400;

  public static of(message: string, errors: t.Errors): DecodeError {
    return new DecodeError(message, {
      kind: "DecodingError",
      errors: errors,
    });
  }
}
