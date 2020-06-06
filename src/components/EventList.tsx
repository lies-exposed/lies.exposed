import ActorList from "@components/ActorList"
import TopicList from "@components/TopicList"
import { EventData } from "@models/event"
import { formatDate } from "@utils//date"
import renderHTMLAST from "@utils/renderHTMLAST"
import { Card, StyledBody } from "baseui/card"
import { FlexGrid, FlexGridItem } from "baseui/flex-grid"
import { CheckIndeterminate } from "baseui/icon"
import { ListItem, ListItemLabel } from "baseui/list"
import { ParagraphSmall } from "baseui/typography"
import * as O from "fp-ts/lib/Option"
import { pipe } from "fp-ts/lib/pipeable"
import { navigate } from "gatsby"
import * as React from "react"

interface EventListProps {
  events: EventData[]
}

const EventList: React.FC<EventListProps> = props => {
  return (
    <div className="events">
      {props.events.map(event => (
        <div key={event.id} id={event.id}>
          <Card
            headerImage={{
              src: O.toUndefined(event.frontmatter.cover),
              width: "100%",
            }}
            title={event.frontmatter.title}
          >
            <StyledBody>
              <FlexGrid flexGridColumnCount={2}>
                <FlexGridItem
                  display="flex"
                  flexGridColumnCount={1}
                  alignItems="center"
                >
                  <TopicList
                    topics={event.frontmatter.topic.map(t => ({
                      ...t,
                      selected: true,
                    }))}
                    onTopicClick={() => undefined}
                  />
                </FlexGridItem>
                <FlexGridItem
                  display="flex"
                  flexGridColumnCount={1}
                  justifyContent="end"
                >
                  {pipe(
                    event.frontmatter.actors,
                    O.fold(
                      () => null,
                      actors => (
                        <ActorList
                          actors={actors.map(a => ({
                            ...a,
                            selected: false,
                          }))}
                          onActorClick={async actor => {
                            await navigate(`/actors/${actor.username}`)
                          }}
                        />
                      )
                    )
                  )}
                </FlexGridItem>
                <FlexGridItem flexGridColumnCount={2}>
                  <time dateTime={formatDate(event.frontmatter.date)}>
                    {formatDate(event.frontmatter.date)}
                  </time>
                </FlexGridItem>
                <FlexGridItem />
                <FlexGridItem flexGridColumnCount={2}>
                  {renderHTMLAST(event.htmlAst)}
                  {O.toNullable(
                    O.option.map(event.frontmatter.links, links => (
                      <ul>
                        {links.map((l, i) => (
                          <ListItem key={i} artwork={CheckIndeterminate}>
                            <ListItemLabel>
                              <ParagraphSmall>
                                <a href={l}>{l}</a>
                              </ParagraphSmall>
                            </ListItemLabel>
                          </ListItem>
                        ))}
                      </ul>
                    ))
                  )}
                </FlexGridItem>
                <FlexGridItem display="none" />
              </FlexGrid>
            </StyledBody>
          </Card>
        </div>
      ))}
    </div>
  )
}

export default EventList
