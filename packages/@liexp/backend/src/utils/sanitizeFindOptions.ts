import { FindOperator } from "typeorm";

/**
 * TypeORM v1 rejects `undefined` and `null` values inside `where` criteria by
 * default (`InvalidFindOptionsWhereBehavior` defaults to `"throw"` for both).
 * TypeORM v0.3 silently skipped `undefined` conditions and mapped `null` to SQL
 * NULL, and a lot of call sites still rely on that: optional query filters are
 * resolved to `undefined` (`O.getOrUndefined`) and spread straight into `where`.
 *
 * Rather than opting the whole datasource back into the lenient behaviour, we
 * strip those values from the criteria before they reach TypeORM. Semantics:
 * - `undefined` / `null` value  → key removed (condition skipped)
 * - nested plain object         → sanitised recursively; removed if it empties
 * - `FindOperator` (Equal, In, IsNull, ...) / `Date` / array value → kept as-is
 *
 * Code that needs an explicit `IS NULL` check must use `IsNull()` (already the
 * convention in this repo), which is a `FindOperator` and therefore preserved.
 */

const isSanitisableObject = (
  value: unknown,
): value is Record<string, unknown> =>
  typeof value === "object" &&
  value !== null &&
  !Array.isArray(value) &&
  !(value instanceof FindOperator) &&
  !(value instanceof Date);

const sanitizeWhereObject = (
  where: Record<string, unknown>,
): Record<string, unknown> => {
  const out: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(where)) {
    if (value === undefined || value === null) {
      continue;
    }

    if (isSanitisableObject(value)) {
      const nested = sanitizeWhereObject(value);
      if (Object.keys(nested).length > 0) {
        out[key] = nested;
      }
      continue;
    }

    out[key] = value;
  }

  return out;
};

/**
 * Sanitise a `where` value which may be a single criteria object or an array of
 * them. Returns `undefined` when nothing usable is left so the caller drops the
 * key entirely.
 */
export const sanitizeWhere = (where: unknown): unknown => {
  if (where === undefined || where === null) {
    return undefined;
  }

  if (Array.isArray(where)) {
    const sanitised = where
      .map((entry) =>
        isSanitisableObject(entry) ? sanitizeWhereObject(entry) : entry,
      )
      .filter(
        (entry) => !isSanitisableObject(entry) || Object.keys(entry).length > 0,
      );

    return sanitised.length > 0 ? sanitised : undefined;
  }

  if (isSanitisableObject(where)) {
    return sanitizeWhereObject(where);
  }

  return where;
};

/**
 * Return a copy of the given find options with its `where` criteria stripped of
 * `undefined` / `null` values. A no-op when there is no `where`.
 */
export const sanitizeFindOptions = <O extends { where?: unknown } | undefined>(
  options: O,
): O => {
  if (
    options === undefined ||
    options === null ||
    !("where" in options) ||
    options.where === undefined
  ) {
    return options;
  }

  return { ...options, where: sanitizeWhere(options.where) };
};
