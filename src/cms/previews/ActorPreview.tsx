import ActorList from "@components/ActorList"
import { ActorPageContentFileNodeFrontmatter } from "@models/actor"
import { renderValidationErrors } from "@utils/renderValidationErrors"
import * as E from "fp-ts/lib/Either"
import { pipe } from "fp-ts/lib/pipeable"
import * as React from "react"

export const ActorPreview: React.FC<any> = props => {
  const { entry } = props
  const { body, ...frontmatter} = entry.getIn(["data"]).toObject()
  const avatar = props.getAsset(entry.getIn(["data", "avatar"]))
  const actor = {
    ...frontmatter,
    date: frontmatter.date.toISOString(),
    avatar:
      avatar !== undefined
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
    selected: false,
  }

  return pipe(
    ActorPageContentFileNodeFrontmatter.decode(actor),
    E.fold(renderValidationErrors, _ => (
      <ActorList
        actors={[{ ..._, selected: true }]}
        onActorClick={() => undefined}
      />
    ))
  )
}
