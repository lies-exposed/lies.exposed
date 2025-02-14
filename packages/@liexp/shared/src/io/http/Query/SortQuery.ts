import * as t from "io-ts/lib/index.js";
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable.js";

export const SortOrderASC = t.literal("ASC");
export const SortOrderDESC = t.literal("DESC");
export const SortOrder = t.union([SortOrderASC, SortOrderDESC], "SortOrder");
export type SortOrder = t.TypeOf<typeof SortOrder>;

export const SortQuery = t.type(
  {
    _sort: optionFromNullable(t.string),
    _order: optionFromNullable(SortOrder),
  },
  "SortQuery",
);

export type SortQuery = t.TypeOf<typeof SortQuery>;
