import { PieChartGraph } from "@components/Common/Graph/PieChartGraph"
import Map from "@components/Map"
import { ProjectFrontmatter } from "@models/Project"
import { Fund } from "@models/events/Fund"
import ParentSize from "@vx/responsive/lib/components/ParentSize"
import * as React from "react"

const getLabelForBy = (fund: Fund): string => {
  switch (fund.by.__type) {
    case "Actor":
      return fund.by.actor.fullName
    case "Group":
      return fund.by.group.name
  }
}
export interface ProjectFundsMapProps {
  project: ProjectFrontmatter
  funds: Fund[]
}

export const ProjectFundsMap: React.FC<ProjectFundsMapProps> = (props) => {
  return (
    <div>
      <ParentSize style={{ height: 300 }}>
        {({ width, height }) => {
          const featureCollection = {
            type: `FeatureCollection` as "FeatureCollection",
            features: [
              {
                type: `Feature` as "Feature",
                geometry: props.project.areas[0],
                properties: props.project,
              },
            ],
          }

          const mapWidth = (width * 2) / 3
          const pieWidth = (width * 1) / 3

          return (
            <div style={{ display: "flex", flexDirection: "row" }}>
              <Map
                width={mapWidth}
                height={height}
                featureCollection={featureCollection}
                center={
                  featureCollection.features[0].geometry.coordinates[0][0]
                }
                zoom={6}
                onMapClick={() => {}}
              />
              <PieChartGraph<Fund>
                width={pieWidth}
                height={height}
                slices={props.funds}
                getLabel={(f) => getLabelForBy(f)}
                getKey={(f) => f.uuid}
                getValue={(f) => f.amount}
              />
            </div>
          )
        }}
      </ParentSize>
    </div>
  )
}
