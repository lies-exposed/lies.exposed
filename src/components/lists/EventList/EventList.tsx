import { EventMD } from "@models/events/EventMetadata"
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
        A.map((event) => (
          <UncategorizedListItem key={event.frontmatter.uuid} item={event}/>
        ))
      )}
    </div>
  )
}

export default EventList
