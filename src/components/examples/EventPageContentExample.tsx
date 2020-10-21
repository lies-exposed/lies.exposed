import {
  EventPageContent,
  EventPageContentProps
} from "@components/EventPageContent"
import { firstEvent } from "@mock-data/events"
import { Card } from "baseui/card"
import * as O from "fp-ts/lib/Option"
import * as R from "fp-ts/lib/Record"
import * as React from "react"

export const eventPageContentArgs: EventPageContentProps = {
  frontmatter: firstEvent,
  body: null,
  tableOfContents: { items: undefined },
  timeToRead: O.none,
}

export const EventPageContentExample: React.FC<EventPageContentProps> = (
  props
) => {
  const pageContentProps = R.isEmpty(props as any)
    ? eventPageContentArgs
    : props

  return (
    <Card overrides={{ Root: { style: { width: "100%" } } }}>
      <EventPageContent {...pageContentProps} />
    </Card>
  )
}
