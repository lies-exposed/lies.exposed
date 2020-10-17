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
        <Block>
          <HeadingXLarge>{frontmatter.name}</HeadingXLarge>
        </Block>
      </FlexGridItem>
      <FlexGridItem
        flexGridColumnCount={2}
        flexGridColumnGap="scale800"
        gridColumnGap="scale800"
        display="flex"
      >
        <FlexGridItem
          display="flex"
          overrides={{
            Block: {
              style: ({ $theme }) => ({
                width: `calc((200% - ${$theme.sizing.scale800}))`,
              }),
            },
          }}
        >
          {pipe(
            frontmatter.images,
            O.map((images) => (
              <Block key={`project-${frontmatter.uuid}`}>
                <Slider
                  key={`project-${frontmatter.uuid}-slider`}
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
              </Block>
            )),
            O.toNullable
          )}
        </FlexGridItem>
        <FlexGridItem
          overrides={{
            Block: { style: { flexGrow: 0 } },
          }}
        >
          <ProjectFundsMap project={frontmatter} funds={funds} />
        </FlexGridItem>
      </FlexGridItem>
      <FlexGridItem>
        <div className="content">{renderHTML({ body })}</div>
      </FlexGridItem>
    </FlexGrid>
  )
}
