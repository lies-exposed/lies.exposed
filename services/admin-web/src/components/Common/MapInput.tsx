import Map from "ol/Map.js";
import View from "ol/View.js";
import GeoJSON from "ol/format/GeoJSON";
import Draw from "ol/interaction/Draw.js";
import TileLayer from "ol/layer/Tile.js";
import VectorLayer from "ol/layer/Vector.js";
import OSMSource from "ol/source/OSM.js";
import VectorSource from "ol/source/Vector.js";
import React from "react";
import { InputProps, useInput } from "react-admin";

const formatOptions = {
  dataProjection: "EPSG:4326",
  featureProjection: "EPSG:3857",
};
const getDefaultFormat = (): GeoJSON => new GeoJSON(formatOptions);

const getDefaultMap = (target: any, featuresLayer: any): Map =>
  new Map({
    target,
    layers: [new TileLayer({ source: new OSMSource() }), featuresLayer],
    view: new View({ center: [0, 0], zoom: 2 }),
  });

type MapInputProps = InputProps & {
  type: "Polygon" | "Point";
};

export const MapInput: React.FC<MapInputProps> = (props) => {
  const {
    input: { onChange, value, ...inputProps },
  } = useInput(props);

  // eslint-disable-next-line
  console.log({ value, inputProps });
  const mapContainer = React.createRef<HTMLDivElement>();

  React.useEffect(() => {
    // eslint-disable-next-line
    if (document.querySelector(".map-input")?.innerHTML === "") {
      const format = getDefaultFormat();
      const features = value ? [format.readFeature(value)] : [];

      const featuresSource = new VectorSource({ features, wrapX: false });
      const featuresLayer = new VectorLayer({ source: featuresSource });

      const target = mapContainer.current;
      const map = getDefaultMap(target, featuresLayer);
      if (features.length > 0) {
        map.getView().fit(featuresSource.getExtent(), {
          maxZoom: 16,
          padding: [80, 80, 80, 80],
        });
      }

      const draw = new Draw({
        source: featuresSource,
        type: props.type as any,
      });
      map.addInteraction(draw);

      const writeOptions = { decimals: 7 };
      draw.on("drawend", ({ feature }) => {
        featuresSource.clear();
        onChange(format.writeGeometry(feature.getGeometry(), writeOptions));
      });
    }

    return () => {
      const mapDiv = document.querySelector(".map-input");
      if (mapDiv !== null) {
        mapDiv.innerHTML = "";
      }
    };
  });

  return (
    <div
      className={"map-input"}
      ref={mapContainer}
      style={{ height: 300, width: 600 }}
    />
  );
};
