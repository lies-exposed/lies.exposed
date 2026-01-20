import { Schema } from "effect";

export const CoreError = Schema.Struct({
  name: Schema.String,
  message: Schema.String,
  details: Schema.Union(Schema.Undefined, Schema.Array(Schema.String)),
}).annotations({
  title: "CoreError",
});

export type CoreError = typeof CoreError.Type;
