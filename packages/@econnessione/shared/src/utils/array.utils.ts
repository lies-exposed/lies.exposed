import * as A from "fp-ts/lib/Array";
import * as Eq from "fp-ts/lib/Eq";
import { pipe } from "fp-ts/lib/function";

export const groupBy = <A>(S: Eq.Eq<A>): ((as: A[]) => A[][]) => {
  return A.chop((as) => {
    const { init, rest } = pipe(
      as,
      A.spanLeft((a: A) => S.equals(a, as[0]))
    );
    return [init, rest];
  });
};
