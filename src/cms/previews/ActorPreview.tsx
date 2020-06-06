import { ActorPageContent } from "@components/ActorPageContent"
import { toAST } from "@utils/markdownHTML"
import * as O from "fp-ts/lib/Option"
import * as React from "react"

export const ActorPreview: React.FC<any> = props => {
  const { entry } = props
  const { body, ...frontmatter } = entry.getIn(["data"]).toJS()
  const avatar = props.getAsset(frontmatter.avatar)

  const actor = {
    ...frontmatter,
    date: frontmatter.date.toISOString(),
    avatar:
      avatar !== undefined
        ? O.some({
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
          })
        : O.none,
    selected: false,
  }

  return (
    <ActorPageContent
      id={""}
      frontmatter={actor}
      htmlAst={toAST(body)}
    />
  )
}
