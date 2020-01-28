import * as O from "fp-ts/lib/Option"
import { pipe } from "fp-ts/lib/pipeable"
import * as React from "react"
import { EventPointData } from "../../types/event"
import { formatDate } from "../../utils/date"
import ActorList from "../ActorList/ActorList"
import { Columns } from "../Common"
import TopicList from "../TopicList/TopicList"

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
          <Columns>
        
            <Columns.Column>
              <TopicList
                topics={[
                  {
                    id: event.topicSlug,
                    x: 0,
                    y: 0,
                    label: event.topicLabel,
                    slug: event.topicSlug,
                    color: event.topicFill,
                    selected: true,
                  },
                ]}
                onTopicClick={() => undefined}
              />
            </Columns.Column>
            <Columns.Column offset={6} size={4} style={{ textAlign: 'right'}}>
              {pipe(
                event.frontmatter.actors,
                O.fold(
                  () => null,
                  actors => (
                    <ActorList
                      actors={actors.map(a => ({
                        ...a,
                        selected: false,
                        color: "trasparent",
                      }))}
                      onActorClick={() => undefined}
                    />
                  )
                )
              )}
            </Columns.Column>
          </Columns>

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
