import { uuid } from "@econnessione/shared/utils/uuid";
import get from "lodash/get";
import has from "lodash/has";
import Feature from "ol/Feature";
import Map from "ol/Map";
import View from "ol/View";
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
    view: new View({ center: [9.18951, 45.46427], zoom: 10 }),
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
  const value =
    props.source && has(props.record, props.source)
      ? get(props.record, props.source)
      : undefined;
  console.log(value);
  React.useEffect(() => {
    if (document.querySelector(`.${mapClassName}`)?.innerHTML === "") {
      const format = getDefaultFormat();
      const features = value ? [new Feature(format.readGeometry(value))] : [];
      // eslint-disable-next-line
      // console.log(features);
      const featuresSource = new VectorSource({ features });
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
