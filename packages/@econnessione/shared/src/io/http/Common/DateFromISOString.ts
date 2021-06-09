import * as t from "io-ts";
import * as DFIS from "io-ts-types/lib/DateFromISOString";

export const DateFromISOString = t.brand(
  t.string,
  (s): s is t.Branded<string, { readonly DateFromISOString: symbol }> =>
    DFIS.DateFromISOString.is(s),
  "DateFromISOString"
);

export type DateFromISOString = t.TypeOf<typeof DateFromISOString>;
