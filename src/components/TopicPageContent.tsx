import { TopicMarkdownRemark } from "@models/topic"
import renderHTMLAST from "@utils/renderHTMLAST"
import { HeadingXLarge } from "baseui/typography"
import * as React from "react"

interface TopicPageContentProps extends TopicMarkdownRemark {}

export const TopicPageContent: React.FC<TopicPageContentProps> = ({
  frontmatter,
  htmlAst,
}) => {
  return (
    <>
      <HeadingXLarge>{frontmatter.label}</HeadingXLarge>
      {renderHTMLAST(htmlAst)}
    </>
  )
}
