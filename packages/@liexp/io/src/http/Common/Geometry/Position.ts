import { Schema } from "effect";

export const Position = Schema.Tuple(Schema.Number, Schema.Number).annotations({
  title: "Position",
});
export type Position = typeof Position.Type;
