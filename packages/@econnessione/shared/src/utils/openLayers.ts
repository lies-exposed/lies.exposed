import * as http from "@io/http";
import { Polygon } from "ol/geom";
import { getArea, } from "ol/sphere";

interface DatumWithGeometry {
  geometry: http.Common.Polygon;
}

export const calculateArea = (data: DatumWithGeometry[]): number => {
  const totalArea = data.reduce((acc, a) => {
    const polygon = new Polygon(a.geometry.coordinates);
    const area = getArea(polygon, { projection: "EPSG:4326" });
    console.log(area);
    return acc + area;
  }, 0);

  return Math.round((totalArea / 1000000) * 100) / 100;
};
