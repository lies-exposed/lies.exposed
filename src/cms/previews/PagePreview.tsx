import { PageContent } from "@components/PageContent"
import { MDtoHTML, HTMLtoAST } from "@utils/markdownHTML"
import { renderValidationErrors } from "@utils/renderValidationErrors"
import * as E from "fp-ts/lib/Either"
import { pipe } from "fp-ts/lib/pipeable"
import * as React from "react"

export const PagePreview: React.FC<any> = props => {

  return pipe(
    E.right(props.entry.getIn(['data']).toJS()),
    E.fold(renderValidationErrors, ({ body, ...frontmatter }) => {
      return (
        <PageContent
          frontmatter={frontmatter}
          htmlAst={HTMLtoAST(MDtoHTML(body))}
          tableOfContents={""}
          timeToRead={2}
        />
      )
    })
  )
}
