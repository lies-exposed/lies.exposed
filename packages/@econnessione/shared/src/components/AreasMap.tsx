import { Area } from "@io/http";
import { areasList } from "@providers/DataProvider";
import { navigate } from "@reach/router";
import ParentSize from "@vx/responsive/lib/components/ParentSize";
import * as QR from "avenger/lib/QueryResult";
import { WithQueries } from "avenger/lib/react";
import { Polygon } from "ol/geom";
import { getArea } from "ol/sphere";
import * as React from "react";
import { ErrorBox } from "./Common/ErrorBox";
import { Loader } from "./Common/Loader";
import Map from "./Map";

interface AreasMapProps {
  center?: [number, number];
  zoom?: number;
}

class AreasMap extends React.PureComponent<AreasMapProps> {
  render(): JSX.Element {
    const { center = [9.18951, 45.46427], zoom = 12 } = this.props;
    return (
      <WithQueries
        queries={{ areas: areasList }}
        params={{
          areas: {
            pagination: { page: 1, perPage: 100 },
            sort: { field: "id", order: "DESC" },
            filter: {},
          },
        }}
        render={QR.fold(Loader, ErrorBox, ({ areas }) => {
          const totalArea = areas.data.reduce((acc, a) => {
            const polygon = new Polygon(a.geometry.coordinates);
            const area = getArea(polygon, { projection: "EPSG:4326" });
            return acc + area;
          }, 0);

          const totalAreaInKm = Math.round((totalArea / 1000000) * 100) / 100;

          // eslint-disable-next-line
          console.log({ totalArea, totalAreaInKm });

          return (
            <ParentSize style={{ minHeight: 600 }}>
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
                      width={width}
                      height={height}
                      data={areas.data}
                      center={center}
                      zoom={zoom}
                      onMapClick={async (features) => {
                        if (features.length > 0) {
                          const area = features[0].getProperties() as Area.Area;
                          // await navigate(`/areas/${area.id}`)
                          if (area) {
                            await navigate(`/areas/${area.id}`);
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
              }}
            </ParentSize>
          );
        })}
      />
    );
  }
}

export default AreasMap;
