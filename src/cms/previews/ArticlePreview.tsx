import { ArticlePageContent } from "@components/ArticlePageContent"
import * as React from "react"

export const ArticlePreview: React.FC<any> = (props) => {
  const { entry } = props
  const { body, ...article } = entry.getIn(["data"]).toJS()

  return (
    <ArticlePageContent
      {...{
        ...article,
        date: article.date.toISOString(),
      }}
      body={body}
    />
  )
}
