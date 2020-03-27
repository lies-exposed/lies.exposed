import { TopicPageContentFileNode } from "@models/topic"
import renderMarkdownAST from "@utils/renderMarkdownAST"
import { HeadingXLarge } from "baseui/typography"
import * as React from "react"

type TopicPageContentProps  = TopicPageContentFileNode['childMarkdownRemark']

export const TopicPageContent: React.FC<TopicPageContentProps> = ({ frontmatter, htmlAst}) => {
  return (
    <>
      <HeadingXLarge>
        {frontmatter.label}
      </HeadingXLarge>
      {renderMarkdownAST(htmlAst)}
    </>
  )
}