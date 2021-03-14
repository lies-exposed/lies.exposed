import { Point, Polygon } from "@io/http/Common";
import Feature from "ol/Feature";
import OlMap from "ol/Map";
import View from "ol/View";
import * as OlControl from "ol/control";
import GEOJSON from "ol/format/GeoJSON";
import Geometry from "ol/geom/Geometry";
import * as OlInteraction from "ol/interaction";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import * as OlProj from "ol/proj";
import OSM from "ol/source/OSM";
import VectorSource from "ol/source/Vector";
import { Circle, Fill, Stroke, Style } from "ol/style";
import * as React from "react";

const formatOptions = {
  dataProjection: "EPSG:4326",
  featureProjection: "EPSG:3857",
};

const geoJSONFormat = new GEOJSON(formatOptions);

interface Datum {
  geometry: Point | Polygon;
}
interface MapProps {
  width: number;
  height: number;
  data: Datum[];
  center: [number, number];
  zoom: number;
  interactions?: OlInteraction.DefaultsOptions;
  controls?: OlControl.DefaultsOptions;
  onMapClick: (geoms: Array<Feature<Geometry>>) => void;
}

const Map: React.FC<MapProps> = ({
  width,
  height,
  data,
  center,
  zoom,
  interactions,
  controls,
  onMapClick,
}) => {
  React.useEffect(() => {
    const features = data.map(({ geometry, ...datum }) => {
      const geom = geoJSONFormat.readGeometry(JSON.stringify(geometry));
      const feature = new Feature(geom);
      feature.setProperties(datum);
      return feature;
    });

    const featureSource = new VectorSource({
      format: geoJSONFormat,
      features,
    });

    const featuresLayer = new VectorLayer({
      source: featureSource,
      style: (feature) => {
        return new Style({
          fill: new Fill({
            color: `#333`,
          }),
          stroke: new Stroke({
            color: `#333`,
            width: 2,
          }),
          image: new Circle({
            radius: 9,
            fill: new Fill({ color: "#333" }),
          }),
        });
      },
    });

    const map = new OlMap({
      interactions: OlInteraction.defaults({
        doubleClickZoom: false,
        dragPan: false,
        mouseWheelZoom: false,
        pinchZoom: true,
        ...interactions,
      }),
      controls: OlControl.defaults(controls),
      target: "map",
      layers: [
        new TileLayer({
          source: new OSM({}),
        }),
        featuresLayer,
      ],
    });

    map.setView(
      new View({
        center: OlProj.fromLonLat(center),
        zoom,
      })
    );

    map.on("click", (evt) => {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      featuresLayer.getFeatures(evt.pixel).then((features) => {
        onMapClick(features);
      });
    });

    return () => {
      const mapDiv = document.querySelector("#map");
      if (mapDiv !== null) {
        mapDiv.innerHTML = "";
      }
    };
  });

  return <div id="map" style={{ width, height }} />;
};

export default Map;
