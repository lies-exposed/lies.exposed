import { Schema } from "effect";
import { OptionFromNullishToNull } from '../Common/OptionFromNullishToNull.js';

export const FilterQuery = Schema.Record({
  key: Schema.String,
  value: OptionFromNullishToNull(
    Schema.Union(
      Schema.Number,
      Schema.String,
      Schema.Array(Schema.String),
      Schema.DateFromString,
      Schema.BigInt,
    ),
  ),
}).annotations({
  title: "FilterQuery",
});
export type FilterQuery = typeof FilterQuery.Type;
