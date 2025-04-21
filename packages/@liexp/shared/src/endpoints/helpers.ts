import { fp } from "@liexp/core/lib/fp/index.js";
import { type EffectCodec } from "@ts-endpoint/core";
import { flow, Schema } from "effect";
import { type ParseError } from "effect/ParseResult";

export const EffectDecoder = <E>(fn: (error: ParseError) => E) => {
  return (schema: EffectCodec<any, any>) => {
    return flow(
      Schema.decodeUnknownEither(schema as Schema.Schema<any>),
      fp.E.mapLeft(fn),
    );
  };
};
