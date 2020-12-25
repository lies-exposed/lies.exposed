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
  id: "",
  frontmatter: firstEvent,
  body: "",
  tableOfContents: O.none,
  timeToRead: O.none,
}

export const EventPageContentExample: React.FC<EventPageContentProps> = (
  props
) => {
  const pageContentProps = R.isEmpty(props as {})
    ? eventPageContentArgs
    : props

  return (
    <Card overrides={{ Root: { style: { width: "100%" } } }}>
      <EventPageContent {...pageContentProps} />
    </Card>
  )
}
