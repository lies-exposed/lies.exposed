import Map from "ol/Map.js";
import View from "ol/View.js";
import GeoJSON from "ol/format/GeoJSON";
import GeometryType from "ol/geom/GeometryType";
import Draw from "ol/interaction/Draw.js";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer";
import "ol/ol.css";
import { OSM as OSMSource, Vector as VectorSource } from "ol/source";
import React from "react";
import { InputProps, useInput } from "react-admin";

const formatOptions = {
  dataProjection: "EPSG:4326",
  featureProjection: "EPSG:3857",
};
const getDefaultFormat = (): GeoJSON => new GeoJSON(formatOptions);

const getDefaultMap = (
  target: HTMLDivElement,
  featuresLayer: VectorLayer
): Map => {
  return new Map({
    target,
    layers: [new TileLayer({ source: new OSMSource() }), featuresLayer],
    view: new View({ center: [0, 0], zoom: 2 }),
  });
};

type MapInputProps = InputProps & {
  type: GeometryType;
};

export const MapInput: React.FC<MapInputProps> = (props) => {
  const inputProps = useInput(props);

  const {
    input: { value, onChange },
  } = inputProps;

  const mapContainer = React.createRef<HTMLDivElement>();
  const mapClassName = `map-input-${props.record.id}`;

  React.useEffect(() => {
    if (document.querySelector(`.${mapClassName}`)?.innerHTML === "") {
      const format = getDefaultFormat();
      const features = value ? [format.readFeature(value)] : [];
      // eslint-disable-next-line
      // console.log(features);
      const featuresSource = new VectorSource({ features, wrapX: false });
      const featuresLayer = new VectorLayer({ source: featuresSource });

      // eslint-disable-next-line
      // console.log(featuresSource);

      const target = mapContainer.current;
      if (target) {
        const map = getDefaultMap(target, featuresLayer);
        if (features.length > 0) {
          map.getView().fit(featuresSource.getExtent(), {
            maxZoom: 16,
            padding: [80, 80, 80, 80],
          });
        }

        const draw = new Draw({
          source: featuresSource,
          type: props.type,
        });
        map.addInteraction(draw);

        const writeOptions = { decimals: 7 };
        draw.on("drawend", (opts) => {
          featuresSource.clear();
          const geometry = opts.feature.getGeometry();
          if (geometry) {
            onChange(format.writeGeometry(geometry, writeOptions));
          }
        });
      }
    }

    return () => {
      const mapDiv = document.querySelector(`.${mapClassName}`);
      if (mapDiv !== null) {
        mapDiv.innerHTML = "";
      }
    };
  });

  // eslint-disable-next-line
  // console.log({ mapContainer, mapClassName });

  return (
    <div
      className={mapClassName}
      ref={mapContainer}
      style={{ height: 300, width: 600 }}
    />
  );
};
