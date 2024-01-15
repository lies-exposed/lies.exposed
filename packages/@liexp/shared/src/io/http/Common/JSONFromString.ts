import * as E from "fp-ts/lib/Either.js";
import * as Json from "fp-ts/lib/Json.js";
import { pipe } from "fp-ts/lib/function.js";
import * as t from "io-ts";

export const JSONFromString = new t.Type<unknown, string, unknown>(
  "JSONFromString",
  t.unknown.is,
  (s, c) => {
    const result = pipe(
      t.string.decode(s),
      E.chain(Json.parse),
      E.fold(() => t.failure(s, c), t.success),
    );
    return result;
  },
  JSON.stringify,
);
