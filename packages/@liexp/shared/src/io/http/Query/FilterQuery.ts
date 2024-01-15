import * as t from "io-ts";
import { BigIntFromString } from "io-ts-types/lib/BigIntFromString.js";
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString.js";
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable.js";

export const FilterQuery = t.record(
  t.string,
  optionFromNullable(
    t.union([
      t.number,
      t.string,
      t.array(t.string),
      DateFromISOString,
      BigIntFromString,
    ]),
  ),
  "FilterQuery",
);
export type FilterQuery = t.TypeOf<typeof FilterQuery>;
