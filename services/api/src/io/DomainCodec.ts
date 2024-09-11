import { fp } from "@liexp/core/lib/fp/index.js";
import * as E from "fp-ts/lib/Either.js";
import { pipe } from "fp-ts/lib/function.js";
import { type ValidationError } from "io-ts";
import { DecodeError, type ControllerError } from "./ControllerError.js";

export interface IOCodec<T, A, Args extends any[]> {
  decodeSingle: (a: A, ...args: Args) => E.Either<ControllerError, T>;
  decodeMany: (a: A[], ...args: Args) => E.Either<ControllerError, T[]>;
}

const toIOCodecError =
  (resource: string) =>
  (e: ValidationError[] | ControllerError): ControllerError => {
    if (Array.isArray(e)) {
      return DecodeError(`Failed to decode ${resource}`, e);
    }
    return e;
  };

export const IOCodec = <T, A, Args extends any[]>(
  f: (a: A, ...args: Args) => E.Either<ValidationError[] | ControllerError, T>,
  resource: string,
): IOCodec<T, A, Args> => {
  return {
    decodeSingle: (b: A, ...args: Args): E.Either<ControllerError, T> => {
      return pipe(f(b, ...args), E.mapLeft(toIOCodecError(resource)));
    },
    decodeMany: (a: A[], ...args: Args): E.Either<ControllerError, T[]> => {
      return pipe(
        a,
        fp.A.traverse(E.Applicative)((a) => f(a, ...args)),
        E.mapLeft(toIOCodecError(resource)),
      );
    },
  };
};
