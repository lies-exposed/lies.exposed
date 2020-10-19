import { ActorPageContent, ActorPageContentProps } from "@components/ActorPageContent"
import { goodActor } from "@mock-data/actors"
import { funds } from "@mock-data/funds"
import { Card } from "baseui/card"
import * as O from "fp-ts/lib/Option"
import * as R from "fp-ts/lib/Record"
import * as React from "react"

const actorFunds = funds.filter(
  (f) => f.by.__type === "Actor" && f.by.actor.uuid === goodActor.uuid
)

export const actorPageContentArgs: ActorPageContentProps = {
  frontmatter: goodActor,
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
