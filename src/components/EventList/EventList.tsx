import * as O from "fp-ts/lib/Option"
import { pipe } from "fp-ts/lib/pipeable"
import * as React from "react"
import { EventData } from "../../types/event"
import { formatDate } from "../../utils/date"
import renderMarkdownAST from "../../utils/renderMarkdownAST"
import ActorList from "../ActorList/ActorList"
import { Card, Content, Media, Heading } from "../Common"
import TopicList from "../TopicList/TopicList"

interface EventListProps {
  events: EventData[]
}

const EventList: React.FC<EventListProps> = props => {
  return (
    <div className="event-list">
      {props.events.map(event => (
        <Card key={event.id} id={event.id}>
          {pipe(
            event.frontmatter.cover,
            O.map(coverSrc => {
             return <Card.Image key={coverSrc} size="4by3" src={coverSrc} />
            }),
            O.toNullable
          )}
          <Card.Content>
            <Media>
              <Media.Item>
                <Heading size={4}>{event.frontmatter.title}</Heading>
                <Heading subtitle size={6}>
                  <TopicList
                    topics={[
                      {
                        id: event.topicSlug,
                        label: event.topicLabel,
                        slug: event.topicSlug,
                        color: event.topicFill,
                        selected: true,
                      },
                    ]}
                    onTopicClick={() => undefined}
                  />
                </Heading>
              </Media.Item>
              <Media.Item position="right">
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
              </Media.Item>
            </Media>
            <Content>
              {renderMarkdownAST(event.htmlAst)}
              <br />
              <time dateTime={formatDate(event.frontmatter.date)}>
                {formatDate(event.frontmatter.date)}
              </time>
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
            </Content>
          </Card.Content>
        </Card>
      ))}
    </div>
  )
}

export default EventList
