import { fp } from "@liexp/core/lib/fp/index.js";
import { type EffectCodec } from "@ts-endpoint/core";
import { flow, Schema } from "effect";
import { type ParseError } from "effect/ParseResult";

export const EffectDecoder = <A, E>(fn: (error: ParseError) => E) => {
  return (schema: EffectCodec<A>) => {
    return flow(
      Schema.decodeUnknownEither(schema as Schema.Schema<A>),
      fp.E.mapLeft(fn),
    );
  };
};
