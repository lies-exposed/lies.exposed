import { fp, pipe } from "@liexp/core/lib/fp/index.js";

export type RawDate = Date | string | null | undefined;

export interface DateFieldSpec {
  field: string;
  /** Nullable columns (`deletedAt`) are allowed to be `null`/`undefined`. */
  allowNullish?: boolean;
}

/**
 * TypeORM date columns come back as a `Date` or as a plain `YYYY-MM-DD` string,
 * regardless of the `Date | null` entity typing, and can desync into `NaT`
 * (invalid) values. Calling `.toISOString()` directly on those either throws
 * inside an fp-ts chain — escaping the `Either` — or yields a value that
 * `Schema.Date` then rejects without naming the field that broke.
 */
export const toValidDate = (d: RawDate): Date | null => {
  if (d === null || d === undefined) return null;
  const date = d instanceof Date ? d : new Date(d);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const dateToISOString = (d: RawDate): string | null => {
  const date = toValidDate(d);
  return date === null ? null : date.toISOString();
};

/** ISO string when the raw value is usable, otherwise the raw value itself. */
export const dateToISOOrRaw = <D extends RawDate>(
  d: D,
): string | Exclude<D, null | undefined> =>
  dateToISOString(d) ?? (d as Exclude<D, null | undefined>);

/** `Date` when the raw value is usable, otherwise the raw value itself. */
export const dateToDateOrRaw = <D extends RawDate>(
  d: D,
): Date | Exclude<D, null | undefined> =>
  toValidDate(d) ?? (d as Exclude<D, null | undefined>);

const formatRawDate = (d: unknown): string => {
  if (typeof d === "string") return JSON.stringify(d);
  if (d instanceof Date)
    return Number.isNaN(d.getTime()) ? "NaT" : d.toISOString();
  return String(d);
};

/** True when the raw value cannot be represented as a valid date. */
export const isInvalidDateValue = (d: RawDate): boolean =>
  toValidDate(d) === null;

/**
 * Suffix naming the fields whose raw value cannot be represented as a valid
 * date — including required (`notNull`) columns that came back `null`. So a
 * decode/encode failure can be diagnosed without re-querying the offending row.
 * Empty when every listed field is usable.
 */
export const describeInvalidDateFields = (
  source: object,
  specs: readonly DateFieldSpec[],
): string => {
  const row = source as Record<string, RawDate>;
  return pipe(
    specs,
    fp.A.filter(({ field, allowNullish }) => {
      const value = row[field];
      if (value === null || value === undefined) return !allowNullish;
      return isInvalidDateValue(value);
    }),
    fp.A.map(({ field }) => `${field}=${formatRawDate(row[field])}`),
    (details) =>
      details.length === 0
        ? ""
        : `: invalid date field(s): ${details.join(", ")}`,
  );
};
