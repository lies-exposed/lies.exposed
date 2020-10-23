import Map from "@components/Map"
import { ProjectFrontmatter } from "@models/Project"
import ParentSize from "@vx/responsive/lib/components/ParentSize"
import * as O from "fp-ts/lib/Option"
import { pipe } from "fp-ts/lib/pipeable"
import * as React from "react"

export interface ProjectFundsMapProps {
  project: ProjectFrontmatter
}

export const ProjectFundsMap: React.FC<ProjectFundsMapProps> = (props) => {
  return (
    <ParentSize style={{ height: 400 }}>
      {({ width, height }) => {
        return pipe(
          props.project.areas,
          O.fold(
            () => null,
            (areas) => {
              const featureCollection = {
                type: `FeatureCollection` as "FeatureCollection",
                features: areas.map((a) => ({
                  type: `Feature` as "Feature",
                  geometry: a,
                  properties: props.project,
                })),
              }

              return (
                <Map
                  width={width}
                  height={height}
                  featureCollection={featureCollection}
                  center={
                    featureCollection.features[0].geometry.coordinates[0][0]
                  }
                  zoom={6}
                  onMapClick={() => {}}
                />
              )
            }
          )
        )
      }}
    </ParentSize>
  )
}
