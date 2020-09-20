import { AreaFrontmatter } from "@models/area"
import { navigateTo } from "@utils/links"
import renderHTMLAST from "@utils/renderHTMLAST"
import { Block } from "baseui/block"
import { HeadingXLarge, HeadingXSmall } from "baseui/typography"
import * as O from "fp-ts/lib/Option"
import { pipe } from "fp-ts/lib/pipeable"
import { navigate } from "gatsby"
import * as React from "react"
import Map from "./Map"
import EditButton from "./buttons/EditButton"
import GroupList from "./lists/GroupList"
import TopicList from "./lists/TopicList"

interface AreaPageContentProps {
  frontmatter: AreaFrontmatter
  htmlAst: object
}

export const AreaPageContent: React.FC<AreaPageContentProps> = ({
  frontmatter,
  htmlAst,
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
    <>
      <Block overrides={{ Block: { style: { textAlign: "right", margin: 10 } } }}>
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
                onGroupClick={async (g) => {
                  await navigateTo(navigate, "groups", g)
                }}
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
                onTopicClick={async (g) => {
                  await navigateTo(navigate, "groups", g)
                }}
              />
            </Block>
          )
        )
      )}
      <div className="content">{renderHTMLAST(htmlAst)}</div>
    </>
  )
}
