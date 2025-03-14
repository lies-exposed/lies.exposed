import { Schema } from "effect";
import { Point } from "./Point.js";
import { Polygon } from "./Polygon.js";

const Geometry = Schema.Union(Point, Polygon).annotations({
  title: "Geometry",
});
type Geometry = typeof Geometry.Type;

export { Geometry, Point, Polygon };
