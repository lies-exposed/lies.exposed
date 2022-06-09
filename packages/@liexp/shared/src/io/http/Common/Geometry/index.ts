import * as t from "io-ts";
import { Point } from "./Point";
import { Polygon } from "./Polygon";

const Geometry = t.union([Point, Polygon], "Geometry");
type Geometry = t.TypeOf<typeof Geometry>;

export { Geometry, Point, Polygon };
