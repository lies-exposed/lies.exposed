import { PieChartGraph } from "@components/Common/Graph/PieChartGraph"
import Map from "@components/Map"
import { ProjectFrontmatter } from "@models/Project"
import { FundFrontmatter } from "@models/events/Fund"
import ParentSize from "@vx/responsive/lib/components/ParentSize"
import { FlexGrid, FlexGridItem } from "baseui/flex-grid"
import * as O from "fp-ts/lib/Option"
import { pipe } from "fp-ts/lib/pipeable"
import * as React from "react"

const getLabelForBy = (fund: FundFrontmatter): string => {
  switch (fund.by.__type) {
    case "Actor":
      return fund.by.actor.fullName
    case "Group":
      return fund.by.group.name
  }
}
export interface ProjectFundsMapProps {
  project: ProjectFrontmatter
  funds: FundFrontmatter[]
}

export const ProjectFundsMap: React.FC<ProjectFundsMapProps> = (props) => {
  return (
    <ParentSize style={{ height: 600 }}>
      {({ width, height }) => {
        const mapWidth = width
        const mapHeight = height / 2
        const pieWidth = width
        const pieHeight = height / 2

        return (
          <FlexGrid>
            <FlexGridItem>
              {pipe(
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
                        width={mapWidth}
                        height={mapHeight}
                        featureCollection={featureCollection}
                        center={
                          featureCollection.features[0].geometry
                            .coordinates[0][0]
                        }
                        zoom={6}
                        onMapClick={() => {}}
                      />
                    )
                  }
                )
              )}
            </FlexGridItem>
            <FlexGridItem>
              <PieChartGraph<FundFrontmatter>
                width={pieWidth}
                height={pieHeight}
                slices={props.funds}
                getLabel={(f) => getLabelForBy(f)}
                getKey={(f) => f.uuid}
                getValue={(f) => f.amount}
              />
            </FlexGridItem>
          </FlexGrid>
        )
      }}
    </ParentSize>
  )
}
