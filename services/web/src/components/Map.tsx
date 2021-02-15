import { Area } from "@econnessione/shared/lib/io/http";
import Feature from "ol/Feature";
import OlMap from "ol/Map";
import View from "ol/View";
import * as OlControl from "ol/control";
import GEOJSON from "ol/format/GeoJSON";
import Geometry from "ol/geom/Geometry";
import * as OlInteraction from "ol/interaction";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import "ol/ol.css";
import * as OlProj from "ol/proj";
import OSM from "ol/source/OSM";
import VectorSource from "ol/source/Vector";
import { Fill, Stroke, Style } from "ol/style";
import * as React from "react";

const formatOptions = {
  dataProjection: "EPSG:4326",
  featureProjection: "EPSG:3857",
};

const geoJSONFormat = new GEOJSON(formatOptions);

interface MapProps {
  width: number;
  height: number;
  features: string[];
  center: [number, number];
  zoom: number;
  interactions?: OlInteraction.DefaultsOptions;
  controls?: OlControl.DefaultsOptions;
  onMapClick: (geoms: Array<Feature<Geometry>>) => void;
}

const Map: React.FC<MapProps> = ({
  width,
  height,
  features: featuresString,
  center,
  zoom,
  interactions,
  controls,
  onMapClick,
}) => {
  React.useEffect(() => {
    const features = featuresString.map(f => geoJSONFormat.readFeature(f));

    // eslint-disable-next-line
    console.log(features);
    const featureSource = new VectorSource({
      format: geoJSONFormat,
      features,
    });

    const featuresLayer = new VectorLayer({
      source: featureSource,
      style: (feature) => {
        const area = feature.getProperties() as Area.Area;
        return new Style({
          fill: new Fill({
            color: `#${area.color}`,
          }),
          stroke: new Stroke({
            color: `#${area.color}`,
            width: 2,
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
          source: new OSM(),
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
