import { Schema } from "effect";
import { Position } from "./Position.js";

export const Point = Schema.Struct({
  type: Schema.Literal("Point"),
  coordinates: Position,
}).annotations({ title: "Point" });

export type Point = typeof Point.Type;
