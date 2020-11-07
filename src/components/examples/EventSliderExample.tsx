import { EventSlider, EventSliderProps } from "@components/sliders/EventSlider"
import { events } from "@mock-data/events"
import { EventMD } from "@models/events"
import { Card } from "baseui/card"
import * as O from "fp-ts/lib/Option"
import * as R from "fp-ts/lib/Record"
import * as React from "react"

export const eventSliderArgs: EventSliderProps = {
  events: events.map((e): EventMD => ({
    frontmatter: e,
    body: null,
    timeToRead: O.none,
    tableOfContents: O.none,
  })),
}

export const EventSliderExample: React.FC<EventSliderProps> = (
  props
) => {
  const pageContentProps = R.isEmpty(props as any)
    ? eventSliderArgs
    : props

  return (
    <Card overrides={{ Root: { style: { width: "100%" } } }}>
      <EventSlider {...pageContentProps} />
    </Card>
  )
}
