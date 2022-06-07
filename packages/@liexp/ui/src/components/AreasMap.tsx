import { Area } from "@liexp/shared/io/http";
import ParentSize from "@vx/responsive/lib/components/ParentSize";
import Feature from "ol/Feature";
import * as React from "react";
import { geoJSONFormat } from "../utils/map.utils";
import Map, { MapProps } from "./Map";

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

  // const totalArea = areas.reduce((acc: number, a: any) => {
  //   const polygon = new Polygon(a.geometry.coordinates);
  //   const area = getArea(polygon, {
  //     projection: "EPSG:4326",
  //   });
  //   return acc + area;
  // }, 0);

  return (
    <>
      <ParentSize style={{ height }}>
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
      </ParentSize>
      {/* <div style={{ textAlign: "center", margin: 40 }}>
        <Typography variant="h3" style={{ fontWeight: 700 }}>
          {totalArea.toFixed(2)}m<sup>2</sup>
        </Typography>
      </div> */}
    </>
  );
};

export default AreasMap;
