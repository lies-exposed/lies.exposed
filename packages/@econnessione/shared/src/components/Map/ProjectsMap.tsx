import { ErrorBox } from "@components/Common/ErrorBox";
import { LazyLoader } from "@components/Common/Loader";
import Map from "@components/Map";
import { Queries } from "@providers/DataProvider";
import { geoJSONFormat } from "@utils/map.utils";
import ParentSize from "@vx/responsive/lib/components/ParentSize";
import * as QR from "avenger/lib/QueryResult";
import { WithQueries } from "avenger/lib/react";
import * as A from "fp-ts/lib/Array";
import Feature from "ol/Feature";
import * as React from "react";

export interface ProjectsMapProps {
  id: string;
  filter: {};
  style?: React.CSSProperties;
}

export const ProjectsMap: React.FC<ProjectsMapProps> = ({
  id,
  filter,
  style,
}) => {
  return (
    <WithQueries
      queries={{
        projects: Queries.Project.getList,
      }}
      params={{
        projects: {
          pagination: {
            perPage: 20,
            page: 1,
          },
          sort: { field: "id", order: "DESC" },
          filter,
        },
      }}
      render={QR.fold(LazyLoader, ErrorBox, ({ projects: { data, total } }) => {
        const areas = A.flatten(data.map((p) => p.areas));
        return (
          <ParentSize style={{ height: 400, ...style }}>
            {({ width, height }) => {
              const features = areas.map(({ geometry, ...datum }) => {
                const geom = geoJSONFormat.readGeometry(geometry);
                const feature = new Feature(geom);
                feature.setProperties(datum);
                return feature;
              });
              return (
                <Map
                  id={`projects-map-${id}`}
                  width={width}
                  height={height}
                  features={features}
                  // center={[0, 0]}
                  // zoom={12}
                  onMapClick={() => {}}
                />
              );
            }}
          </ParentSize>
        );
      })}
    />
  );
};
