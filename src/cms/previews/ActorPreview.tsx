import { ActorPageContent } from "@components/ActorPageContent"
import { eventMetadataMapEmpty } from "@mock-data/events-metadata"
import * as O from "fp-ts/lib/Option"
import * as React from "react"

export const ActorPreview: React.FC<any> = (props) => {
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
              },
            },
          })
        : O.none,
    selected: false,
  }

  return (
    <ActorPageContent
      frontmatter={actor}
      metadata={eventMetadataMapEmpty}
      body={body}
      timeToRead={O.some(2)}
      tableOfContents={{ items: [] }}
    />
  )
}
