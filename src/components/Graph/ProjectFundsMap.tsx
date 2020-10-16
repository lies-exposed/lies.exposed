import { PieChartGraph } from "@components/Common/Graph/PieChartGraph"
import Map from "@components/Map"
import ByEitherGroupOrActorList from "@components/lists/ByEitherGroupOrActorList"
import { funds } from "@mock-data/funds"
import { ProjectFrontmatter } from "@models/Project"
import { FundFrontmatter } from "@models/events/Fund"
import ParentSize from "@vx/responsive/lib/components/ParentSize"
import { Block } from "baseui/block"
import {
  HeadingMedium,
  ParagraphMedium
} from "baseui/typography"
import * as A from "fp-ts/lib/Array"
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
  const projectAmount = A.array.reduce(
    props.funds,
    0,
    (acc, f) => acc + f.amount
  )

  return (
    <div>
      <ParentSize style={{ height: 300 }}>
        {({ width, height }) => {
          const mapWidth = (width * 2) / 3
          const pieWidth = (width * 1) / 3

          return (
            <div style={{ display: "flex", flexDirection: "row" }}>
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
                        height={height}
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
              <PieChartGraph<FundFrontmatter>
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
      <Block>
        <ParagraphMedium>
          Fondi <strong>{projectAmount}</strong> euro
        </ParagraphMedium>
        <HeadingMedium>Lista di finanziatori</HeadingMedium>
        <ByEitherGroupOrActorList
          by={funds.map((f) => f.by)}
          avatarScale="scale1000"
          onByClick={() => {}}
        />
      </Block>
    </div>
  )
}
