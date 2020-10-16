import { AreaMD } from "@models/area"
import { GroupFrontmatter } from "@models/group"
import { TopicFrontmatter } from "@models/topic"
import { renderHTML } from "@utils/renderHTML"
import { Block } from "baseui/block"
import { FlexGrid, FlexGridItem } from "baseui/flex-grid"
import { HeadingXLarge, HeadingXSmall } from "baseui/typography"
import * as O from "fp-ts/lib/Option"
import { pipe } from "fp-ts/lib/pipeable"
import * as React from "react"
import Map from "./Map"
import EditButton from "./buttons/EditButton"
import GroupList from "./lists/GroupList"
import TopicList from "./lists/TopicList"

export interface AreaPageContentProps extends AreaMD {
  onGroupClick: (g: GroupFrontmatter) => void
  onTopicClick: (t: TopicFrontmatter) => void
}

export const AreaPageContent: React.FC<AreaPageContentProps> = ({
  frontmatter,
  body,
  onGroupClick,
  onTopicClick,
}) => {
  const featureCollection = {
    type: `FeatureCollection` as "FeatureCollection",
    features: [
      {
        type: `Feature` as "Feature",
        geometry: frontmatter.polygon,
        properties: frontmatter,
      },
    ],
  }

  return (
    <FlexGrid width="100%">
      <FlexGridItem width="100%">
        <Block
          overrides={{ Block: { style: { textAlign: "right", margin: 10 } } }}
        >
          <div style={{ textAlign: "right", padding: 10 }}>
            <EditButton resourceName="areas" resource={frontmatter} />
          </div>
        </Block>
        <HeadingXLarge>{frontmatter.label}</HeadingXLarge>
        <Map
          width={600}
          height={300}
          featureCollection={featureCollection}
          center={featureCollection.features[0].geometry.coordinates[0][0]}
          zoom={6}
          onMapClick={() => {}}
        />
        {pipe(
          frontmatter.groups,
          O.fromPredicate((g) => Array.isArray(g) && g.length > 0),
          O.fold(
            () => null,
            (groups) => (
              <Block>
                <HeadingXSmall>Groups</HeadingXSmall>
                <GroupList
                  groups={groups.map((g) => ({ ...g, selected: false }))}
                  avatarScale="scale1000"
                  onGroupClick={onGroupClick}
                />
              </Block>
            )
          )
        )}
        {pipe(
          frontmatter.topics,
          O.fromPredicate((g) => Array.isArray(g) && g.length > 0),
          O.fold(
            () => null,
            (topics) => (
              <Block>
                <HeadingXSmall>Topics</HeadingXSmall>
                <TopicList
                  topics={topics.map((g) => ({ ...g, selected: true }))}
                  onTopicClick={onTopicClick}
                />
              </Block>
            )
          )
        )}
        <div className="content">{renderHTML({ body })}</div>
      </FlexGridItem>
    </FlexGrid>
  )
}
