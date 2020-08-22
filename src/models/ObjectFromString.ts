import * as E from "fp-ts/lib/Either"
import { pipe } from "fp-ts/lib/pipeable"
import * as t from "io-ts"

export const ObjectFromString = new t.Type<unknown, string, unknown>(
  "ObjectFromString",
  t.unknown.is,
  (s, c) => {
    const result = pipe(
      E.parseJSON(s as any, t.identity),
      E.fold(() => t.failure(s, c), t.success)
    )
    return result
  },
  JSON.stringify
)
