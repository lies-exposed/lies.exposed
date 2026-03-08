import { pipe } from "@liexp/core/lib/fp/index.js";
import * as O from "fp-ts/lib/Option.js";
import * as R from "fp-ts/lib/Record.js";

/**
 * Unwraps an object of fp-ts Options, keeping only the Some values.
 * None fields are stripped entirely from the result — useful for building
 * TypeORM partial-update payloads where absent keys mean "no change".
 */
export const foldOptionals = <T extends Record<string, O.Option<any>>>(
  obj: T,
): { [K in keyof T]: T[K] extends O.Option<infer A> ? A : never } =>
  pipe(
    obj,
    R.filter(O.isSome),
    R.map((v) => v.value),
  ) as { [K in keyof T]: T[K] extends O.Option<infer A> ? A : never };
