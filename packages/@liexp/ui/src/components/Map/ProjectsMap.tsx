import { ParentSize } from "@visx/responsive";
import * as A from "fp-ts/Array";
import Feature from "ol/Feature";
import * as React from "react";
import { useQuery } from "react-query";
import { geoJSONFormat } from "../../utils/map.utils";
import Map from "../Map";
import QueriesRenderer from "../QueriesRenderer";

export interface ProjectsMapProps {
  id: string;
  filter: any;
  style?: React.CSSProperties;
}

export const ProjectsMap: React.FC<ProjectsMapProps> = ({
  id,
  filter,
  style,
}) => {
  return (
    <QueriesRenderer
      queries={{
        projects: useQuery({
          queryKey: ["projects"],
          queryFn: () => Promise.resolve([] as any[]),
        }),
      }}
      render={({ projects: data }) => {
        const areas = A.flatten(data.data.map((p: any) => p.areas));
        return (
          <ParentSize style={{ height: 400, ...style }}>
            {({ width, height }) => {
              const features = areas.map(({ geometry, ...datum }: any) => {
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
      }}
    />
  );
};
