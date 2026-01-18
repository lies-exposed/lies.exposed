import * as O from "fp-ts/lib/Option.js";
import * as A from "fp-ts/lib/ReadonlyArray.js";
import { pipe } from "fp-ts/lib/function.js";

export const fromNonEmptyArray = <A>(v: readonly A[]): O.Option<readonly A[]> =>
  pipe(v, O.fromPredicate(A.isNonEmpty));
