import { ActorPageContent, ActorPageContentProps } from "@components/ActorPageContent"
import { firstActor } from "@mock-data/actors"
import { funds } from "@mock-data/funds"
import { Card } from "baseui/card"
import * as O from "fp-ts/lib/Option"
import * as R from "fp-ts/lib/Record"
import * as React from "react"

const actorFunds = funds.filter(
  (f) => f.by.__type === "Actor" && f.by.actor.uuid === firstActor.uuid
)

export const actorPageContentArgs: ActorPageContentProps = {
  frontmatter: firstActor,
  body: null,
  tableOfContents: { items: undefined },
  timeToRead: O.none,
  funds: actorFunds,
}


export const ActorPageContentExample: React.FC<ActorPageContentProps> = (
  props
) => {
  const pageContentProps = R.isEmpty(props as any)
    ? actorPageContentArgs
    : props

  return (
    <Card overrides={{ Root: { style: { width: "100%" } } }}>
      <ActorPageContent {...pageContentProps} />
    </Card>
  )
}
