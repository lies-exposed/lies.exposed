/**
 * Returns the first non-empty string from the given candidates,
 * or `undefined` if all are empty, null, or undefined.
 *
 * Use this instead of chained `??` when the values are strings that
 * could be empty — `??` only skips null/undefined, not `""`.
 *
 * @example
 * firstNonEmpty("", "foo", "bar") // → "foo"
 * firstNonEmpty(null, undefined, "bar") // → "bar"
 * firstNonEmpty("", null)  // → undefined
 */
export const firstNonEmpty = (
  ...values: (string | null | undefined)[]
): string | undefined => values.find((v) => !!v) as string | undefined;
