import { Schema } from "effect";
import { OptionFromNullishToNull } from "../Common/OptionFromNullishToNull";

export const SortOrderASC = Schema.Literal("ASC");
export const SortOrderDESC = Schema.Literal("DESC");
export const SortOrder = Schema.Union(SortOrderASC, SortOrderDESC).annotations({
  title: "SortOrder",
});
export type SortOrder = typeof SortOrder.Type;

export const SortQuery = Schema.Struct({
  _sort: OptionFromNullishToNull(Schema.String),
  _order: OptionFromNullishToNull(SortOrder),
}).annotations({
  title: "SortQuery",
});

export type SortQuery = typeof SortQuery.Type;
