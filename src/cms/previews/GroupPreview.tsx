import { GroupPageContent } from "@components/GroupPageContent"
import { GroupFrontmatter } from "@models/group"
import { MDtoHTML, HTMLtoAST } from "@utils/markdownHTML"
import { renderValidationErrors } from "@utils/renderValidationErrors"
import * as E from "fp-ts/lib/Either"
import * as O from 'fp-ts/lib/Option'
import { pipe } from "fp-ts/lib/pipeable"
import * as React from "react"

export const GroupPreview: React.FC<any> = ({
  entry,
  getAsset,
  widgetFor,
  ...props
}) => {
  const { body, ...frontmatter } = entry.getIn(["data"]).toObject()
  const avatar = getAsset(entry.getIn(["data", "avatar"]))

  const group = {
    ...frontmatter,
    date: frontmatter.date.toISOString(),
    avatar:
      frontmatter.avatar !== undefined
        ? {
            childImageSharp: {
              fluid: {
                src: avatar.url,
                aspectRatio: 1,
                srcSet: avatar.url,
                sizes: "",
                base64: "",
                tracedSVG: "",
                srcWebp: undefined,
                srcSetWebp: undefined,
                media: undefined,
              },
            },
          }
        : undefined,
    members:
      frontmatter.members !== undefined ? frontmatter.members.toJS() : [],
  }

  return pipe(
    GroupFrontmatter.decode(group),
    E.fold(renderValidationErrors, f => (
      <>
        <GroupPageContent
          frontmatter={f}
          members={O.none}
          htmlAst={HTMLtoAST(MDtoHTML(body))}
          onMemberClick={() => {}}
        />
        
      </>
    ))
  )
}
