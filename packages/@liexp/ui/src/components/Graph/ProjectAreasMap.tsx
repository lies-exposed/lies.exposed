import { type Project } from "@liexp/shared/io/http";
import ParentSize from "@visx/responsive/lib/components/ParentSize";
import * as O from "fp-ts/Option";
import { pipe } from "fp-ts/function";
import Feature from "ol/Feature";
import * as React from "react";
import { geoJSONFormat } from "../../utils/map.utils";
import Map from "../Map";

export interface ProjectAreasMapProps {
  project: Project.Project;
}

export const ProjectAreasMap: React.FC<ProjectAreasMapProps> = (props) => {
  return (
    <ParentSize style={{ height: 400 }}>
      {({ width, height }) => {
        return pipe(
          O.some(props.project.areas),
          O.fold(
            () => null,
            (areas) => {
              const features = areas.map(({ geometry, ...datum }) => {
                const geom = geoJSONFormat.readGeometry(geometry);
                const feature = new Feature(geom);
                feature.setProperties(datum);
                return feature;
              });
              return (
                <Map
                  id={`project-${props.project.id}`}
                  width={width}
                  height={height}
                  features={features}
                  center={[0, 0]}
                  zoom={14}
                  onMapClick={() => {}}
                />
              );
            }
          )
        );
      }}
    </ParentSize>
  );
};
