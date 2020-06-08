import { ArticlePage } from "@components/ArticlePage"
import { HTMLtoAST, MDtoHTML } from "@utils/markdownHTML"
import * as React from "react"

export const ArticlePreview: React.FC<any> = props => {
  const { entry } = props
  const { body, ...article } = entry.getIn(["data"]).toJS()

  console.log({ body: HTMLtoAST(body) })
  const htmlAst = HTMLtoAST(MDtoHTML(body))
  console.log("htmlAst", htmlAst)

  return (
    <ArticlePage
      {...{
        ...article,
        date: article.date.toISOString(),
      }}
      htmlAst={htmlAst}
    />
  )
}
