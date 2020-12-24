import { EventMD } from "@models/events"
import { UncategorizedMD } from "@models/events/Uncategorized"
import * as A from "fp-ts/lib/Array"
import { pipe } from "fp-ts/lib/pipeable"
// import { navigate } from "gatsby"
import * as React from "react"
import { UncategorizedListItem } from "./UncategorizedListItem"

export interface EventListProps {
  events: EventMD[]
}

const EventList: React.FC<EventListProps> = (props) => {
  return (
    <div className="events" style={{ width: "100%" }}>
      {pipe(
        props.events,
        A.map((event) => {
          if (UncategorizedMD.is(event)) {
            return (
              <UncategorizedListItem
                key={event.frontmatter.uuid}
                item={event}
              />
            )
          }
          return "Not implemented"
        })
      )}
    </div>
  )
}

export default EventList
