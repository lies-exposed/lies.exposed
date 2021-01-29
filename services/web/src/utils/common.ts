import * as A from "fp-ts/lib/Array";
import * as Eq from "fp-ts/lib/Eq";

export const group = <A>(S: Eq.Eq<A>): ((as: A[]) => A[][]) => {
  return A.chop((as) => {
    const { init, rest } = A.spanLeft((a: A) => S.equals(a, as[0]))(as);
    return [init, rest];
  });
};
