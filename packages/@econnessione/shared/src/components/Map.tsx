import { geoJSONFormat } from "@utils/map.utils";
import Feature from "ol/Feature";
import OlMap from "ol/Map";
import View from "ol/View";
import * as OlControl from "ol/control";
import * as olExtent from "ol/extent";
import Geometry from "ol/geom/Geometry";
import * as OlInteraction from "ol/interaction";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import OSM from "ol/source/OSM";
import VectorSource from "ol/source/Vector";
import { Circle, Fill, Stroke, Style } from "ol/style";
import * as React from "react";

interface MapProps {
  id: string;
  width: number;
  height: number;
  features: Feature[];
  center?: [number, number];
  zoom: number;
  interactions?: OlInteraction.DefaultsOptions;
  controls?: OlControl.DefaultsOptions;
  onMapClick: (geoms: Array<Feature<Geometry>>) => void;
}

const Map: React.FC<MapProps> = ({
  id,
  width,
  height,
  features,
  center,
  zoom,
  interactions,
  controls,
  onMapClick,
}) => {
  const mapId = `map-${id}`;
  React.useEffect(() => {
    const mapCenter =
      features.length === 0
        ? [0, 0]
        : olExtent.getCenter(features[0].getGeometry().getExtent());

    const featureSource = new VectorSource({
      format: geoJSONFormat,
      features,
    });

    const featuresLayer = new VectorLayer({
      source: featureSource,
      style: (feature) => {
        return new Style({
          fill: new Fill({
            color: `#33333380`,
          }),
          stroke: new Stroke({
            color: `#FF000080`,
            width: 2,
          }),
          image: new Circle({
            radius: 9,
            fill: new Fill({ color: "#33333300" }),
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
      target: mapId,
      layers: [
        new TileLayer({
          source: new OSM({}),
        }),
        featuresLayer,
      ],
    });

    map.setView(
      new View({
        zoom,
        center: mapCenter,
      })
    );

    // if (features[0]) {
    //   map
    //     .getView()
    //     .fit(features[0].getGeometry().getExtent(), { size: map.getSize() });
    // }

    map.on("click", (evt) => {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      featuresLayer.getFeatures(evt.pixel).then((features) => {
        onMapClick(features);
      });
    });

    return () => {
      const mapDiv = document.querySelector(`#${mapId}`);
      if (mapDiv !== null) {
        mapDiv.innerHTML = "";
      }
    };
  });

  return <div id={mapId} style={{ width, height }} />;
};

export default Map;
