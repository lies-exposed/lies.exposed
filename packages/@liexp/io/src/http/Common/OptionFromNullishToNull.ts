import { Schema } from "effect";

export const OptionFromNullishToNull = <A, I, R>(
  schema: Schema.Schema<A, I, R>,
) => Schema.OptionFromNullishOr(schema, null);
