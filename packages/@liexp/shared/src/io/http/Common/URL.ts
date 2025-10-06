import { Schema } from "effect";
import * as E from "fp-ts/lib/Either.js";
import * as IOE from "fp-ts/lib/IOEither.js";
import { pipe } from "fp-ts/lib/function.js";

export interface URLBrand {
  readonly URL: unique symbol;
}

const urlPattern =
  /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)/;

export const URL = Schema.String.pipe(
  Schema.filter((url) =>
    pipe(
      IOE.tryCatch(() => urlPattern.test(url), E.toError),
      IOE.mapLeft(() => false),
      IOE.fold(
        (e) => () => e,
        (r) => () => r,
      ),
    )(),
  ),
).pipe(Schema.brand("URL"));

export type URL = typeof URL.Type;
export const MaybeURL = Schema.Union(URL, Schema.String).annotations({
  title: "MaybeURL",
});
export type MaybeURL = typeof MaybeURL.Type;
