/**
 * Convert a `string | string[]` query param to a `string[]`.
 * URL search params can be single values or arrays; this normalises them.
 */
export function toStringArray(
  value: string | string[] | undefined,
): string[] {
  if (value === undefined) {
    return [];
  }
  if (typeof value === "string") {
    return value.length > 0 ? [value] : [];
  }
  return value;
}

/**
 * Convert a `string | string[]` query param to a single string.
 * When the param is an array, take the first element.
 */
export function toString(value: string | string[] | undefined): string {
  if (value === undefined) {
    return "";
  }
  if (typeof value === "string") {
    return value;
  }
  return value[0] ?? "";
}
