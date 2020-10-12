import { TopicMD } from "@models/topic"
import { renderHTML } from "@utils/renderHTML"
import { Block } from "baseui/block"
import { HeadingXLarge } from "baseui/typography"
import * as React from "react"
import EditButton from "./buttons/EditButton"

interface TopicPageContentProps extends TopicMD {}

export const TopicPageContent: React.FC<TopicPageContentProps> = ({
  frontmatter,
  body,
}) => {
  return (
    <>
      <Block overrides={{ Block: { style: { textAlign: "right" } } }}>
        <EditButton resourceName="topics" resource={frontmatter} />
      </Block>
      <HeadingXLarge>{frontmatter.label}</HeadingXLarge>
      {renderHTML({body})}
    </>
  )
}
