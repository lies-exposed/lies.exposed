import { Topic } from "@econnessione/io"
import { renderHTML } from "@utils/renderHTML"
import { Block } from "baseui/block"
import { FlexGrid, FlexGridItem } from "baseui/flex-grid"
import { HeadingXLarge } from "baseui/typography"
import * as React from "react"
import EditButton from "./buttons/EditButton"

export interface TopicPageContentProps extends Topic.TopicMD {}

export const TopicPageContent: React.FC<TopicPageContentProps> = ({
  frontmatter,
  body,
}) => {
  return (
    <FlexGrid width="100%">
      <FlexGridItem width="100%">
        <Block overrides={{ Block: { style: { textAlign: "right" } } }}>
          <EditButton resourceName="topics" resource={frontmatter} />
        </Block>
        <HeadingXLarge>{frontmatter.label}</HeadingXLarge>
        {renderHTML({ body })}
      </FlexGridItem>
    </FlexGrid>
  )
}
