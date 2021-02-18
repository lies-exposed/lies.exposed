import { Area, Common } from "@io/http";
import * as React from "react";
import Map from "./Map";

interface AreasMapProps<F extends Common.BaseFrontmatter> {
  areas: F[];
  width: number;
  height: number;
}

const AreasMap = ({
  areas,
  width,
  height,
}: AreasMapProps<Area.Area>): JSX.Element => {
  const features = areas.map((a) => a.geometry);

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
        features={features}
        center={[0, 0]}
        zoom={10}
        onMapClick={async (features) => {
          if (features.length > 0) {
            const area = features[0].getProperties() as Area.Area;
            // await navigate(`/areas/${area.id}`)
            if (area) {
              alert(JSON.stringify(area));
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
