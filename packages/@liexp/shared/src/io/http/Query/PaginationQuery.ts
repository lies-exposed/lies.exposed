import * as t from "io-ts";
import { NumberFromString } from "io-ts-types/NumberFromString";
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable.js";

export const PaginationQuery = t.type(
  {
    _start: optionFromNullable(NumberFromString.pipe(t.Int)),
    _end: optionFromNullable(NumberFromString.pipe(t.Int)),
  },
  "PaginationQuery",
);

export type PaginationQuery = t.TypeOf<typeof PaginationQuery>;
