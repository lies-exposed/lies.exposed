import { Schema } from "effect";

export const Currency = Schema.Union(
  Schema.Literal("eur"),
  Schema.Literal("dollar"),
).annotations({
  title: "Currency",
});
export type Currency = typeof Currency.Type;

export const MoneyAmount = Schema.Struct({
  amount: Schema.Number,
  currency: Currency,
}).annotations({
  title: "MoneyAmount",
});
export type MoneyAmount = typeof MoneyAmount.Type;
