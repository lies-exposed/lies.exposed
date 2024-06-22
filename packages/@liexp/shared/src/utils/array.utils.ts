import * as A from "fp-ts/Array";
import type * as Eq from "fp-ts/Eq";
import { pipe } from "fp-ts/function";

export const groupBy = <A>(S: Eq.Eq<A>): ((as: A[]) => A[][]) => {
  return A.chop((as) => {
    const { init, rest } = pipe(
      as,
      A.spanLeft((a: A) => S.equals(a, as[0])),
    );
    return [init, rest];
  });
};
