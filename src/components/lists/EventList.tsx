import ActorList from "@components/lists/ActorList"
import TopicList from "@components/lists/TopicList"
import { EventMarkdownRemark } from "@models/event"
import { formatDate } from "@utils//date"
import renderHTMLAST from "@utils/renderHTMLAST"
import { Block } from "baseui/block"
import { Card, StyledBody } from "baseui/card"
import { FlexGrid, FlexGridItem } from "baseui/flex-grid"
import { CheckIndeterminate, Overflow } from "baseui/icon"
import { StyledLink } from "baseui/link"
import { ListItem, ListItemLabel } from "baseui/list"
import { ParagraphSmall } from "baseui/typography"
import * as O from "fp-ts/lib/Option"
import { pipe } from "fp-ts/lib/pipeable"
import { navigate } from "gatsby"
import * as React from "react"
import GroupList from "./GroupList"

interface EventListProps {
  events: EventMarkdownRemark[]
}

const EventList: React.FC<EventListProps> = (props) => {
  return (
    <div className="events">
      {props.events.map((event) => (
        <div key={event.frontmatter.uuid} id={event.frontmatter.uuid}>
          <Card
            headerImage={{
              src: O.toUndefined(event.frontmatter.cover),
              width: "100%",
            }}
            title={event.frontmatter.title}
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
              <FlexGrid flexGridColumnCount={2}>
                <FlexGridItem
                  display="flex"
                  flexGridColumnCount={1}
                  alignItems="center"
                >
                  {pipe(
                    event.fields.topics,
                    (topics) => (
                      // eslint-disable-next-line react/jsx-key
                      <TopicList
                        topics={topics.map((t) => ({
                          ...t,
                          selected: true,
                        }))}
                        onTopicClick={() => undefined}
                      />
                    )
                  )}
                </FlexGridItem>
                <FlexGridItem
                  display="flex"
                  flexGridColumnCount={1}
                  alignItems="flex-end"
                  flexDirection="column"
                >
                  {pipe(
                    event.fields.groups,
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
                  {pipe(
                    event.fields.actors,
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
                <FlexGridItem flexGridColumnCount={2}>
                  <time dateTime={formatDate(event.frontmatter.date)}>
                    {formatDate(event.frontmatter.date)}
                  </time>
                </FlexGridItem>
                <FlexGridItem />
                <FlexGridItem flexGridColumnCount={2}>
                  {renderHTMLAST(event.htmlAst)}
                  {O.toNullable(
                    O.option.map(event.frontmatter.links, (links) => (
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
