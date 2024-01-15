import * as t from "io-ts";
import { Position } from "./Position.js";

export const Point = t.strict(
  {
    type: t.literal("Point"),
    coordinates: Position,
  },
  "Point",
);

export type Point = t.TypeOf<typeof Point>;
