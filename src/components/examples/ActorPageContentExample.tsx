import {
  ActorPageContent,
  ActorPageContentProps,
} from "@components/ActorPageContent"
import { extractEventsMetadata } from "@helpers/event"
import { goodActor } from "@mock-data/actors"
import { events } from "@mock-data/events"
import { Card } from "baseui/card"
import * as O from "fp-ts/lib/Option"
import * as R from "fp-ts/lib/Record"
import * as React from "react"

export const actorPageContentArgs: ActorPageContentProps = {
  frontmatter: goodActor,
  body: null,
  tableOfContents: O.none,
  timeToRead: O.none,
  metadata: extractEventsMetadata({ type: "Actor", elem: goodActor })(events),
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
