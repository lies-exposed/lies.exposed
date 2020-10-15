import { Slider } from "@components/Slider/Slider"
import ActorList from "@components/lists/ActorList"
import GroupList from "@components/lists/GroupList"
import TopicList from "@components/lists/TopicList"
import { EventMD } from "@models/event"
import { formatDate } from "@utils//date"
import { renderHTML } from "@utils/renderHTML"
import { Accordion, Panel } from "baseui/accordion"
import { Block } from "baseui/block"
import { Card, StyledBody } from "baseui/card"
import { FlexGrid, FlexGridItem } from "baseui/flex-grid"
import { CheckIndeterminate, Overflow } from "baseui/icon"
import { StyledLink } from "baseui/link"
import { ListItem, ListItemLabel } from "baseui/list"
import { ParagraphSmall } from "baseui/typography"
import * as A from "fp-ts/lib/Array"
import * as O from "fp-ts/lib/Option"
import { pipe } from "fp-ts/lib/pipeable"
import { navigate } from "gatsby"
import * as React from "react"

export interface EventListProps {
  events: EventMD[]
}

const EventList: React.FC<EventListProps> = (props) => {
  return (
    <div className="events">
      {pipe(
        props.events,
        A.map((event) => (
          <div
            key={event.frontmatter.uuid}
            id={event.frontmatter.uuid}
            style={{
              marginBottom: 40,
            }}
          >
            <Card
              title={
                <StyledLink href={`/events/${event.frontmatter.uuid}`}>
                  {event.frontmatter.title}
                </StyledLink>
              }
            >
              <StyledBody>
                <Block overrides={{ Block: { style: { textAlign: "right" } } }}>
                  <StyledLink
                    href={`/admin/#/collections/events/entries/${event.frontmatter.uuid}`}
                    target="_blank"
                  >
                    <Overflow size={24} />
                  </StyledLink>
                </Block>

                <FlexGrid flexGridColumnCount={1} flexDirection="column">
                  <FlexGridItem display="flex" flexGridItemCount={1}>
                    <FlexGridItem
                      display="flex"
                      flexGridItemCount={1}
                      alignItems="center"
                    >
                      {pipe(event.frontmatter.topics, (topics) => (
                        // eslint-disable-next-line react/jsx-key
                        <TopicList
                          topics={topics.map((t) => ({
                            ...t,
                            selected: true,
                          }))}
                          onTopicClick={async (t) =>
                            await navigate(`/topics/${t.uuid}`)
                          }
                        />
                      ))}
                    </FlexGridItem>
                    <FlexGridItem
                      display="flex"
                      flexGridColumnCount={1}
                      alignItems="flex-end"
                      flexDirection="column"
                    >
                      {pipe(
                        event.frontmatter.groups,
                        O.fold(
                          () => null,
                          (groups) => (
                            <GroupList
                              groups={groups.map((g) => ({
                                ...g,
                                selected: false,
                              }))}
                              onGroupClick={async (group) => {
                                await navigate(`/groups/${group.uuid}`)
                              }}
                              avatarScale="scale1000"
                            />
                          )
                        )
                      )}
                    </FlexGridItem>
                    <FlexGridItem
                      display="flex"
                      alignItems="flex-end"
                      flexDirection="column"
                      flexGridColumnCount={1}
                    >
                      {pipe(
                        event.frontmatter.actors,
                        O.fold(
                          () => null,
                          (actors) => (
                            <ActorList
                              actors={actors.map((a) => ({
                                ...a,
                                selected: false,
                              }))}
                              onActorClick={async (actor) => {
                                await navigate(`/actors/${actor.uuid}`)
                              }}
                              avatarScale="scale1000"
                            />
                          )
                        )
                      )}
                    </FlexGridItem>
                  </FlexGridItem>

                  <FlexGridItem display="flex" flexGridColumnCount={3}>
                    <time dateTime={formatDate(event.frontmatter.date)}>
                      {formatDate(event.frontmatter.date)}
                    </time>
                  </FlexGridItem>

                  {pipe(
                    event.frontmatter.images,
                    O.map((images) => (
                      // eslint-disable-next-line react/jsx-key
                      <FlexGridItem>
                        <Slider
                          key="home-slider"
                          height={600}
                          slides={images.map((i) => ({
                            authorName: "",
                            info: O.getOrElse(() => "")(i.description),
                            imageURL: i.image.publicURL,
                          }))}
                          arrows={true}
                          adaptiveHeight={true}
                          dots={true}
                          size="contain"
                        />
                      </FlexGridItem>
                    )),
                    O.toNullable
                  )}
                  <FlexGrid flexGridColumnCount={3}>
                    <FlexGridItem display="flex" flexDirection="column">
                      {renderHTML({ body: event.body })}
                      {pipe(
                        event.frontmatter.links,
                        O.map((links) => (
                          // eslint-disable-next-line react/jsx-key
                          <Accordion>
                            <Panel title={`Links (${links.length})`}>
                              <ul>
                                {links.map((l, i) => (
                                  <ListItem
                                    key={i}
                                    artwork={CheckIndeterminate}
                                  >
                                    <ListItemLabel>
                                      <ParagraphSmall>
                                        <a href={l}>{l}</a>
                                      </ParagraphSmall>
                                    </ListItemLabel>
                                  </ListItem>
                                ))}
                              </ul>
                            </Panel>
                          </Accordion>
                        )),
                        O.toNullable
                      )}
                    </FlexGridItem>
                  </FlexGrid>
                </FlexGrid>
              </StyledBody>
            </Card>
          </div>
        ))
      )}
    </div>
  )
}

export default EventList
