import { ProjectMD } from "@models/Project"
import { renderHTML } from "@utils/renderHTML"
import { Block } from "baseui/block"
import { HeadingXLarge } from "baseui/typography"
import * as React from "react"
import Map from "./Map"
import EditButton from "./buttons/EditButton"

interface ProjectPageContentProps extends ProjectMD {}

export const ProjectPageContent: React.FC<ProjectPageContentProps> = ({
  frontmatter,
  body,
}) => {
  const featureCollection = {
    type: `FeatureCollection` as "FeatureCollection",
    features: frontmatter.areas.map((p) => ({
      type: `Feature` as "Feature",
      geometry: p,
      properties: frontmatter,
    })),
  }

  return (
    <>
      <Block
        overrides={{ Block: { style: { textAlign: "right", margin: 10 } } }}
      >
        <div style={{ textAlign: "right", padding: 10 }}>
          <EditButton resourceName="areas" resource={frontmatter} />
        </div>
      </Block>
      <HeadingXLarge>{frontmatter.name}</HeadingXLarge>
      <Map
        width={600}
        height={300}
        featureCollection={featureCollection}
        center={featureCollection.features[0].geometry.coordinates[0][0]}
        zoom={6}
        onMapClick={() => {}}
      />
      <div className="content">{renderHTML({ body })}</div>
    </>
  )
}
