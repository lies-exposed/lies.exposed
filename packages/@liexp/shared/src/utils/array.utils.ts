import * as A from "fp-ts/lib/Array.js";
import type * as Eq from "fp-ts/lib/Eq.js";
import { pipe } from "fp-ts/lib/function.js";

export const groupBy = <A>(S: Eq.Eq<A>): ((as: A[]) => A[][]) => {
  return A.chop((as) => {
    const { init, rest } = pipe(
      as,
      A.spanLeft((a: A) => S.equals(a, as[0])),
    );
    return [init, rest];
  });
};

export type NonEmptyArray<A> = readonly [A, ...A[]];

export const isNonEmpty = <A>(as: readonly A[]): as is readonly [A, ...A[]] =>
  as.length > 0;

function nonEmptyArrayOr<A, B>(
  as: readonly A[] | undefined | null,
  orElse: B,
): NonEmptyArray<A> | B;
function nonEmptyArrayOr<A extends readonly [A, ...A[]], B>(
  as: A | undefined | null,
  orElse: B,
): A | B;

function nonEmptyArrayOr<A, B>(arr: A, orElse: B): [A, ...A[]] | B {
  return arr && isNonEmpty<A>(arr as any) ? (arr as any) : orElse;
}

export { nonEmptyArrayOr };
