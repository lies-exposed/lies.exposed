import { fp } from "@liexp/core/lib/fp/index.js";
import {
  _DecodeError,
  DecodeError,
} from "@liexp/shared/lib/io/http/Error/DecodeError.js";
import { type ParseError } from "effect/ParseResult";
import * as E from "fp-ts/lib/Either.js";
import { pipe } from "fp-ts/lib/function.js";

type EitherE<A> = E.Either<_DecodeError, A>;

export interface IOCodec<T, A, Args extends any[]> {
  decodeSingle: (a: A, ...args: Args) => EitherE<T>;
  decodeMany: (a: A[], ...args: Args) => EitherE<readonly T[]>;
}

const toIOCodecError =
  (resource: string) =>
  (e: ParseError | _DecodeError): _DecodeError => {
    if (!(e instanceof _DecodeError)) {
      return DecodeError.of(`Failed to decode ${resource}`, e);
    }
    return e;
  };

export const IOCodec = <T, A, Args extends any[]>(
  f: (a: A, ...args: Args) => E.Either<ParseError | _DecodeError, T>,
  resource: string,
): IOCodec<T, A, Args> => {
  return {
    decodeSingle: (b: A, ...args: Args): EitherE<T> => {
      return pipe(f(b, ...args), E.mapLeft(toIOCodecError(resource)));
    },
    decodeMany: (a: A[], ...args: Args): EitherE<readonly T[]> => {
      return pipe(
        a,
        fp.A.traverse(E.Applicative)((a) => f(a, ...args)),
        E.mapLeft(toIOCodecError(resource)),
      );
    },
  };
};
