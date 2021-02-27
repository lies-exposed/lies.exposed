import { Area, Common } from "@io/http";
import { navigate } from "@reach/router";
import * as React from "react";
import Map from "./Map";

interface AreasMapProps<F extends Common.BaseFrontmatter> {
  areas: F[];
  center: [number, number];
  zoom: number;
  width: number;
  height: number;
}

const AreasMap = ({
  areas,
  center,
  zoom,
  width,
  height,
}: AreasMapProps<Area.Area>): JSX.Element => {

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
        width={width}
        height={height}
        features={areas}
        center={center}
        zoom={zoom}
        onMapClick={async (features) => {
          if (features.length > 0) {
            const area = features[0].getProperties() as Area.Area;
            // await navigate(`/areas/${area.id}`)
            if (area) {
              await navigate(`/areas/${area.id}`)
            }
          }
        }}
        interactions={{
          doubleClickZoom: true,
          dragPan: true,
        }}
      />
    </div>
  );
};

export default AreasMap;
