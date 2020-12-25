import { Events } from "@econnessione/io"
import * as A from "fp-ts/lib/Array"
import { pipe } from "fp-ts/lib/pipeable"
import * as React from "react"
import { UncategorizedListItem } from "./UncategorizedListItem"

export interface EventListProps {
  events: Events.EventMD[]
}

const EventList: React.FC<EventListProps> = (props) => {
  return (
    <div className="events" style={{ width: "100%" }}>
      {pipe(
        props.events,
        A.map((event) => {
          if (Events.Uncategorized.UncategorizedMD.is(event)) {
            return (
              <UncategorizedListItem
                key={event.frontmatter.id}
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
