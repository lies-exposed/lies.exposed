import { Schema } from "effect";
import { Position } from "./Position.js";

export const Polygon = Schema.Struct({
  type: Schema.Literal("Polygon"),
  coordinates: Schema.Array(
    Schema.Array(Position).annotations({ title: "Positions" }),
  ).annotations({
    title: "Coordinates",
  }),
}).annotations({ title: "Polygon" });

export type Polygon = typeof Polygon.Type;
