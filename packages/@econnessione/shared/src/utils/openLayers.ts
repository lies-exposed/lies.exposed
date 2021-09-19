import { Polygon } from "ol/geom";
import { getArea } from "ol/sphere";
import * as http from "@io/http";

interface DatumWithGeometry {
  geometry: http.Common.Polygon;
}

/**
 * Calculate the area in square meters for the given geometries
 * @param data DatumWithGeometry[]
 * @returns number
 */
export const calculateAreaInSQM = (data: DatumWithGeometry[]): number => {
  const totalArea = data.reduce((acc, a) => {
    const polygon = new Polygon(a.geometry.coordinates);
    const area = getArea(polygon, { projection: "EPSG:4326" });
    return acc + area;
  }, 0);
  const paddedArea = Math.round(totalArea * 100) / 100;
  return paddedArea;
};
