import * as t from "io-ts";
import { Position } from "./Position";

export const Polygon = t.strict(
  {
    type: t.literal("Polygon"),
    coordinates: t.array(t.array(Position, "Positions"), "Coordinates"),
  },
  "Polygon",
);
export type Polygon = t.TypeOf<typeof Polygon>;
