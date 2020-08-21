import { ArticleMarkdownRemark } from "@models/article"
import renderHTMLAST from "@utils/renderHTMLAST"
import { HeadingXXLarge } from "baseui/typography"
import * as React from 'react'
import { MainContent } from "./MainContent"

type ArticlePageProps = ArticleMarkdownRemark

export const ArticlePage: React.FC<ArticlePageProps> = props => {
  return (
    <MainContent>
      <HeadingXXLarge>{props.frontmatter.title}</HeadingXXLarge>
      {renderHTMLAST(props.htmlAst)}
    </MainContent>
  )
}
