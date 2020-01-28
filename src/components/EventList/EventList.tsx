import * as O from "fp-ts/lib/Option"
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
          {O.toNullable(
            O.option.map(event.frontmatter.links, links => (
              <ul>
                {links.map((l, i) => (
                  <li key={i}>
                    <a href={l}>{l}</a>
                  </li>
                ))}
              </ul>
            ))
          )}
        </div>
      ))}
    </div>
  )
}

export default EventList
