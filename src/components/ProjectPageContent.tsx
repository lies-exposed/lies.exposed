import { ProjectMD } from "@models/Project"
import { FundFrontmatter } from "@models/events/Fund"
import { renderHTML } from "@utils/renderHTML"
import { Block } from "baseui/block"
import { FlexGrid, FlexGridItem } from "baseui/flex-grid"
import { HeadingXLarge } from "baseui/typography"
import * as O from "fp-ts/lib/Option"
import { pipe } from "fp-ts/lib/pipeable"
import * as React from "react"
import { ProjectFundsMap } from "./Graph/ProjectFundsMap"
import { Slider } from "./Slider/Slider"
import EditButton from "./buttons/EditButton"

export interface ProjectPageContentProps extends ProjectMD {
  funds: FundFrontmatter[]
}

export const ProjectPageContent: React.FC<ProjectPageContentProps> = ({
  frontmatter,
  body,
  funds,
}) => {
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
        <HeadingXLarge>{frontmatter.name}</HeadingXLarge>
        <FlexGridItem>
          {pipe(
            frontmatter.images,
            O.map((images) => (
              <Slider
                key="home-slider"
                height={400}
                slides={images.map((i) => ({
                  authorName: "",
                  info: O.getOrElse(() => "")(i.description),
                  imageURL: i.image.publicURL,
                }))}
                arrows={true}
                adaptiveHeight={true}
                dots={true}
                size="contain"
              />
            )),
            O.toNullable
          )}
        </FlexGridItem>

        <ProjectFundsMap project={frontmatter} funds={funds} />
        <div className="content">{renderHTML({ body })}</div>
      </FlexGridItem>
    </FlexGrid>
  )
}
