import { PageContent } from "@components/PageContent"
import { renderValidationErrors } from "@utils/renderValidationErrors"
import * as E from "fp-ts/lib/Either"
import * as O from "fp-ts/lib/Option"
import { pipe } from "fp-ts/lib/pipeable"
import * as React from "react"

export const PagePreview: React.FC<any> = (props) => {
  return pipe(
    E.right(props.entry.getIn(["data"]).toJS()),
    E.fold(renderValidationErrors, ({ body, ...frontmatter }) => {
      return (
        <PageContent
          frontmatter={frontmatter}
          body={body}
          tableOfContents={{ items: [] }}
          timeToRead={O.some(2)}
        />
      )
    })
  )
}
