import { Schema } from "effect";
import * as E from "fp-ts/lib/Either.js";
import * as IOE from "fp-ts/lib/IOEither.js";
import { pipe } from "fp-ts/lib/function.js";

export interface TagBrand {
  readonly Tag: unique symbol;
}

const tagPattern = /^((?!_)[A-Za-z0-9]+)(?:$)/i;

export const Tag = Schema.String.pipe(
  Schema.filter((s) =>
    pipe(
      IOE.tryCatch(() => tagPattern.test(s), E.toError),
      IOE.mapLeft(() => false),
      IOE.fold(
        (e) => () => e,
        (r) => () => r,
      ),
    )(),
  ),
).annotations({
  title: "Tag",
});

export type Tag = typeof Tag.Type;
