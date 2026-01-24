import { fp } from "@liexp/core/lib/fp/index.js";
import { DecodeError } from "@liexp/io/lib/http/Error/DecodeError.js";
import { type Schema } from "effect";
import { type ParseError } from "effect/ParseResult";
import * as E from "fp-ts/lib/Either.js";
import { pipe } from "fp-ts/lib/function.js";

type EitherE<A> = E.Either<DecodeError, A>;

export interface IOCodec<A, I, D, E, Args extends any[]> {
  decodeSingle: (a: D, ...args: Args) => EitherE<A>;
  decodeMany: (a: readonly D[], ...args: Args) => EitherE<readonly A[]>;

  encodeSingle: (a: E, ...args: Args) => EitherE<I>;
  encodeMany: (a: readonly E[], ...args: Args) => EitherE<readonly I[]>;
}

const toIOCodecError =
  (resource: string) =>
  (e: ParseError | DecodeError): DecodeError => {
    if (!(e instanceof DecodeError)) {
      return DecodeError.of(`Failed to decode ${resource}`, e);
    }
    return e;
  };

export const IOCodec = <A, I, D, E, Args extends any[]>(
  codec: Schema.Schema<A, I, never>,
  {
    decode,
    encode,
  }: {
    decode: (a: D, ...args: Args) => E.Either<ParseError | DecodeError, A>;
    encode: (a: E, ...args: Args) => E.Either<ParseError | DecodeError, I>;
  },
  resource: string,
): IOCodec<A, I, D, E, Args> => {
  return {
    decodeSingle: (b: D, ...args: Args): EitherE<A> => {
      return pipe(decode(b, ...args), E.mapLeft(toIOCodecError(resource)));
    },
    decodeMany: (a: readonly D[], ...args: Args): EitherE<readonly A[]> => {
      return pipe(
        a,
        fp.A.traverse(E.Applicative)((a) => decode(a, ...args)),
        E.mapLeft(toIOCodecError(resource)),
      );
    },
    encodeSingle: (a: E, ...args: Args): EitherE<I> => {
      return pipe(encode(a, ...args), E.mapLeft(toIOCodecError(resource)));
    },
    encodeMany: (a: readonly E[], ...args: Args): EitherE<readonly I[]> => {
      return pipe(
        a,
        fp.A.traverse(E.Applicative)((a) => encode(a, ...args)),
        E.mapLeft(toIOCodecError(resource)),
      );
    },
  };
};
