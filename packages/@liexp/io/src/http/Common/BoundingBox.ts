import { Schema } from "effect";

export const BoundingBoxIO = Schema.Union(
  Schema.Tuple(Schema.Number, Schema.Number, Schema.Number, Schema.Number),
  Schema.Array(Schema.Number),
).annotations({
  title: "BoundingBoxIO",
});

export type BoundingBoxIO = typeof BoundingBoxIO.Type;
