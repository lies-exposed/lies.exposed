import * as t from "io-ts";
import { Point } from "./Point.js";
import { Polygon } from "./Polygon.js";

const Geometry = t.union([Point, Polygon], "Geometry");
type Geometry = t.TypeOf<typeof Geometry>;

export { Geometry, Point, Polygon };
