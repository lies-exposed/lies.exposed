import * as O from "fp-ts/lib/Option";
import * as A from "fp-ts/lib/ReadonlyArray";
import { pipe } from "fp-ts/lib/function.js";

export const fromNonEmptyArray = <A>(v: readonly A[]): O.Option<readonly A[]> =>
  pipe(v, O.fromPredicate(A.isNonEmpty));
