import GEOJSON from "ol/format/GeoJSON";

const formatOptions = {
  dataProjection: "EPSG:4326",
  featureProjection: "EPSG:3857",
};

export const geoJSONFormat = new GEOJSON(formatOptions);
