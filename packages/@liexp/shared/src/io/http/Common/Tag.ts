import * as E from "fp-ts/Either";
import * as IOE from "fp-ts/IOEither";
import { pipe } from "fp-ts/function";
import * as t from "io-ts";

export interface TagBrand {
  readonly Tag: unique symbol;
}

const tagPattern = /^((?!_)[A-Za-z0-9]+)(?:$)/i;

export const Tag = t.brand(
  t.string,
  (s): s is t.Branded<string, TagBrand> =>
    pipe(
      IOE.tryCatch(() => tagPattern.test(s), E.toError),
      IOE.mapLeft((e) => false),
      IOE.fold(
        (e) => () => e,
        (r) => () => r,
      ),
    )(),
  "Tag",
);

export type Tag = t.TypeOf<typeof Tag>;
