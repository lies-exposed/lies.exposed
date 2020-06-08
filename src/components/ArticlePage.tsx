import { ArticleFileNodeFrontmatter } from "@models/article"
import renderHTMLAST from "@utils/renderHTMLAST"
import { HeadingXXLarge } from "baseui/typography"
import * as React from 'react'
import { MainContent } from "./MainContent"

type ArticlePageProps = ArticleFileNodeFrontmatter & {
  htmlAst: object
}

export const ArticlePage: React.FC<ArticlePageProps> = props => {
  return (
    <MainContent>
      <HeadingXXLarge>{props.title}</HeadingXXLarge>
      {renderHTMLAST(props.htmlAst)}
    </MainContent>
  )
}
