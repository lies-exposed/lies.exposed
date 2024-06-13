import { uuid } from "@liexp/shared/lib/utils/uuid.js";
import get from "lodash/get.js";
import has from "lodash/has.js";
import Feature from "ol/Feature.js";
import Map from "ol/Map.js";
import View from "ol/View.js";
import GeoJSON from "ol/format/GeoJSON.js";
import { Geometry } from "ol/geom";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer.js";
import { OSM as OSMSource, Vector as VectorSource } from "ol/source.js";
import * as React from "react";
import { type FieldProps } from "react-admin";

const formatOptions = {
  dataProjection: "EPSG:4326",
  featureProjection: "EPSG:3857",
};
const getDefaultFormat = (): GeoJSON => new GeoJSON(formatOptions);

const getDefaultMap = (
  target: HTMLDivElement,
  featuresLayer: VectorLayer<Feature<Geometry>>,
): Map => {
  return new Map({
    target,
    layers: [new TileLayer({ source: new OSMSource() }), featuresLayer],
    view: new View({ center: [9.18951, 45.46427], zoom: 10 }),
  });
};

type MapFieldProps = FieldProps & {
  type: string;
};

export const MapField: React.FC<MapFieldProps> = (props) => {
  const mapContainer = React.createRef<HTMLDivElement>();
  // eslint-disable-next-line
  const [id] = React.useState(uuid());
  const mapClassName = `map-field-${id}`;
  const value =
    props.source && has(props.record, props.source)
      ? get(props.record, props.source)
      : undefined;

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
