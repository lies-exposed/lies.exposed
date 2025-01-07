import { fp } from "@liexp/core/lib/fp/index.js";
import {
  type _DecodeError,
  DecodeError,
} from "@liexp/shared/lib/io/http/Error/DecodeError.js";
import * as E from "fp-ts/lib/Either.js";
import { pipe } from "fp-ts/lib/function.js";
import { type ValidationError } from "io-ts";

export interface IOCodec<T, A, Args extends any[]> {
  decodeSingle: (a: A, ...args: Args) => E.Either<_DecodeError, T>;
  decodeMany: (a: A[], ...args: Args) => E.Either<_DecodeError, T[]>;
}

const toIOCodecError =
  (resource: string) =>
  (e: ValidationError[] | _DecodeError): _DecodeError => {
    if (Array.isArray(e)) {
      return DecodeError.of(`Failed to decode ${resource}`, e);
    }
    return e;
  };

export const IOCodec = <T, A, Args extends any[]>(
  f: (a: A, ...args: Args) => E.Either<ValidationError[] | _DecodeError, T>,
  resource: string,
): IOCodec<T, A, Args> => {
  return {
    decodeSingle: (b: A, ...args: Args): E.Either<_DecodeError, T> => {
      return pipe(f(b, ...args), E.mapLeft(toIOCodecError(resource)));
    },
    decodeMany: (a: A[], ...args: Args): E.Either<_DecodeError, T[]> => {
      return pipe(
        a,
        fp.A.traverse(E.Applicative)((a) => f(a, ...args)),
        E.mapLeft(toIOCodecError(resource)),
      );
    },
  };
};
