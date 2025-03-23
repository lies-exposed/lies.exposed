import { Schema } from "effect";
import { OptionFromNullishToNull } from "../Common/OptionFromNullishToNull";

const IntFromString = Schema.NumberFromString.pipe(
  Schema.filter((s) => Schema.is(Schema.Int)(s)),
);

export const PaginationQuery = Schema.Struct({
  _start: OptionFromNullishToNull(IntFromString),
  _end: OptionFromNullishToNull(IntFromString),
}).annotations({
  title: "PaginationQuery",
});

export type PaginationQuery = typeof PaginationQuery.Type;
