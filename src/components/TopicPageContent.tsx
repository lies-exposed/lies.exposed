import { TopicMarkdownRemark } from "@models/topic"
import renderHTMLAST from "@utils/renderHTMLAST"
import { Block } from "baseui/block"
import { HeadingXLarge } from "baseui/typography"
import * as React from "react"
import EditButton from "./buttons/EditButton"

interface TopicPageContentProps extends TopicMarkdownRemark {}

export const TopicPageContent: React.FC<TopicPageContentProps> = ({
  frontmatter,
  htmlAst,
}) => {
  return (
    <>
      <Block overrides={{ Block: { style: { textAlign: "right" } } }}>
        <EditButton resourceName="topics" resource={frontmatter} />
      </Block>
      <HeadingXLarge>{frontmatter.label}</HeadingXLarge>
      {renderHTMLAST(htmlAst)}
    </>
  )
}
