
import * as t from "io-ts"
import { Position } from "./Position"


export const Point = t.interface(
  {
    type: t.literal("Point"),
    coordinates: Position,
  },
  "Point"
)

export type Point = t.TypeOf<typeof Point>