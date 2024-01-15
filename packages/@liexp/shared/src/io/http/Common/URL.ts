import * as E from "fp-ts/lib/Either.js";
import * as IOE from "fp-ts/lib/IOEither.js";
import { pipe } from "fp-ts/lib/function.js";
import * as t from "io-ts";

export interface URLBrand {
  readonly URL: unique symbol;
}

const urlPattern =
  /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)/;

export const URL = t.brand(
  t.string,
  (url): url is t.Branded<string, URLBrand> =>
    pipe(
      IOE.tryCatch(() => urlPattern.test(url), E.toError),
      IOE.mapLeft((e) => false),
      IOE.fold(
        (e) => () => e,
        (r) => () => r,
      ),
    )(),
  "URL",
);

export type URL = t.TypeOf<typeof URL>;
export const MaybeURL = t.union([URL, t.string], "MaybeURL");
export type MaybeURL = t.TypeOf<typeof MaybeURL>;
