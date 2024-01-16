import { type Area } from "@liexp/shared/lib/io/http/index.js";
import Feature from "ol/Feature.js";
import * as React from "react";
import { AutoSizer } from "react-virtualized";
import { geoJSONFormat } from "../utils/map.utils.js";
import Map, { type MapProps } from "./Map.js";

export interface AreasMapProps extends Pick<MapProps<any>, "onMapClick"> {
  center?: [number, number];
  zoom?: number;
  areas: Area.Area[];
  height?: number;
}

const AreasMap: React.FC<AreasMapProps> = (props) => {
  const {
    center = [9.18951, 45.46427],
    zoom = 12,
    height = 600,
    onMapClick,
    areas,
  } = props;

  const features = areas.map(({ geometry, ...datum }: any) => {
    const geom = geoJSONFormat.readGeometry(geometry);
    const feature = new Feature(geom);
    feature.setProperties(datum);
    return feature;
  });

  return (
    <AutoSizer style={{ width: "100%", height }}>
      {({ width, height }) => {
        return (
          <div
            style={{
              marginLeft: "auto",
              marginRight: "auto",
              marginTop: 20,
              marginBottom: 20,
            }}
          >
            <Map
              id="areas"
              width={width}
              height={height - 40}
              features={features}
              center={center}
              zoom={zoom}
              onMapClick={(features) => {
                onMapClick(features);
              }}
              interactions={{
                doubleClickZoom: true,
                dragPan: true,
              }}
            />
          </div>
        );
      }}
    </AutoSizer>
  );
};

export default AreasMap;
