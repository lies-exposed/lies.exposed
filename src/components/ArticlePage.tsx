import { ArticleMarkdownRemark } from "@models/article"
import { formatDate } from "@utils/date"
import renderHTMLAST from "@utils/renderHTMLAST"
import { HeadingXXLarge, LabelSmall } from "baseui/typography"
import * as React from "react"
import { MainContent } from "./MainContent"
import EditButton from "./buttons/EditButton"

type ArticlePageProps = ArticleMarkdownRemark

export const ArticlePage: React.FC<ArticlePageProps> = (props) => {
  return (
    <MainContent>
      <div style={{ textAlign: "right", padding: 10 }}>
        <EditButton resourceName="articles" resource={props.frontmatter} />
      </div>
      <HeadingXXLarge>{props.frontmatter.title}</HeadingXXLarge>
      <LabelSmall>{formatDate(props.frontmatter.date)}</LabelSmall>
      {renderHTMLAST(props.htmlAst)}
    </MainContent>
  )
}
