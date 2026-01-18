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
  return arr && isNonEmpty<A>(arr as []) ? (arr as [A, ...A[]]) : orElse;
}

export { nonEmptyArrayOr };
