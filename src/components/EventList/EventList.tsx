import * as React from "react"
import { EventPointData } from "../../types/event"
import { formatDate } from "../../utils/date"
import { Tag } from "../Common"

interface EventListProps {
  events: EventPointData[]
}

const EventList: React.FC<EventListProps> = props => {
  return (
    <div className="event-list">
      {props.events.map(event => (
        <div key={event.id} id={event.id} style={{ paddingTop: 60 }}>
          <div className="subtitle">{event.frontmatter.title}</div>
          <div className="">{formatDate(event.frontmatter.date)}</div>
          <div>
            <Tag style={{ backgroundColor: event.topicFill, color: "white" }}>
              {event.topicLabel}
            </Tag>
          </div>
          <div
            className="content"
            dangerouslySetInnerHTML={{ __html: event.html }}
          />
        </div>
      ))}
    </div>
  )
}

export default EventList