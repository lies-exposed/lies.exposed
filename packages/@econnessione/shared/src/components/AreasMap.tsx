import { Area } from "@io/http";
import { Typography } from "@material-ui/core";
import { Queries } from "@providers/DataProvider";
import { navigate } from "@reach/router";
import { geoJSONFormat } from "@utils/map.utils";
import ParentSize from "@vx/responsive/lib/components/ParentSize";
import * as QR from "avenger/lib/QueryResult";
import { WithQueries } from "avenger/lib/react";
import Feature from "ol/Feature";
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
        queries={{ areas: Queries.Area.getList }}
        params={{
          areas: {
            pagination: { page: 1, perPage: 20 },
            sort: { field: "id", order: "DESC" },
            filter: {},
          },
        }}
        render={QR.fold(Loader, ErrorBox, ({ areas }) => {
          const features = areas.data.map(({ geometry, ...datum }) => {
            const geom = geoJSONFormat.readGeometry(geometry);
            const feature = new Feature(geom);
            feature.setProperties(datum);
            return feature;
          });

          const totalArea = areas.data.reduce((acc, a) => {
            const polygon = new Polygon(a.geometry.coordinates);
            const area = getArea(polygon, {
              projection: "EPSG:4326",
            });
            return acc + area;
          }, 0);

          return (
            <>
              <ParentSize style={{ height: 600 }}>
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
                        height={height}
                        features={features}
                        center={center}
                        zoom={zoom}
                        onMapClick={async (features) => {
                          if (features.length > 0) {
                            const area =
                              features[0].getProperties() as Area.Area;
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
              <div style={{ textAlign: "center", margin: 40 }}>
                <Typography variant="h3" style={{ fontWeight: 700 }}>
                  {totalArea.toFixed(2)}m<sup>2</sup>
                </Typography>
              </div>
            </>
          );
        })}
      />
    );
  }
}

export default AreasMap;
