import { uuid } from "@econnessione/shared/utils/uuid";
import Map from "ol/Map.js";
import View from "ol/View.js";
import GeoJSON from "ol/format/GeoJSON";
import GeometryType from "ol/geom/GeometryType";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer";
import { OSM as OSMSource, Vector as VectorSource } from "ol/source";
import React from "react";
import { FieldProps } from "react-admin";

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

type MapFieldProps = FieldProps & {
  type: GeometryType;
};

export const MapField: React.FC<MapFieldProps> = (props) => {
  // eslint-disable-next-line
  console.log({ props });

  const mapContainer = React.createRef<HTMLDivElement>();
  // eslint-disable-next-line
  const mapClassName = `map-field-${uuid()}`;
  const value = props.record ? props.record[props.source ?? "id"] : undefined;
  React.useEffect(() => {
    if (document.querySelector(`.${mapClassName}`)?.innerHTML === "") {
      const format = getDefaultFormat();
      const features = value
        ? [format.readFeature(Array.isArray(value) ? value[0] : value)]
        : [];
      // eslint-disable-next-line
      // console.log(features);
      const featuresSource = new VectorSource({ features, wrapX: false });
      const featuresLayer = new VectorLayer({ source: featuresSource });

      const target = mapContainer.current;
      if (target) {
        const map = getDefaultMap(target, featuresLayer);
        if (features.length > 0) {
          map.getView().fit(featuresSource.getExtent(), {
            maxZoom: 16,
            padding: [80, 80, 80, 80],
          });
        }
      }
    }

    return () => {
      const mapDiv = document.querySelector(`.${mapClassName}`);
      if (mapDiv !== null) {
        mapDiv.innerHTML = "";
      }
    };
  });

  return (
    <div
      className={mapClassName}
      ref={mapContainer}
      style={{ height: 300, width: 600 }}
    />
  );
};
