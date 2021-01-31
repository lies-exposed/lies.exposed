import { MarkdownRenderer } from "@components/Common/MarkdownRenderer";
import { Slider } from "@components/Common/Slider/Slider";
import ActorList from "@components/lists/ActorList";
import GroupList from "@components/lists/GroupList";
import TopicList from "@components/lists/TopicList";
import { Actor, Events, Group, Topic } from "@econnessione/shared/lib/io/http";
import { faMapMarker } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { eventDate } from "@helpers/event";
import { formatDate } from "@utils/date";
import { Accordion, Panel } from "baseui/accordion";
import { Block } from "baseui/block";
import { Card, StyledBody } from "baseui/card";
import { FlexGrid, FlexGridItem } from "baseui/flex-grid";
import { CheckIndeterminate, Overflow } from "baseui/icon";
import { StyledLink } from "baseui/link";
import { ListItem, ListItemLabel } from "baseui/list";
import { ParagraphSmall } from "baseui/typography";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import * as React from "react";

interface UncategorizedListItemProps {
  item: Events.Uncategorized.Uncategorized;
  actors: Actor.Actor[];
  topics: Topic.TopicFrontmatter[];
  groups: Group.Group[];
}

export const UncategorizedListItem: React.FC<UncategorizedListItemProps> = ({
  item,
  actors,
  topics,
  groups,
}) => {
  return (
    <div
      key={item.id}
      id={item.id}
      style={{
        marginBottom: 40,
      }}
    >
      <Card
        title={
          <StyledLink href={`/events/${item.id}`}>{item.title}</StyledLink>
        }
      >
        <StyledBody>
          <Block overrides={{ Block: { style: { textAlign: "right" } } }}>
            <StyledLink
              href={`/admin/#/collections/events/entries/${item.id}`}
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
                <TopicList
                  topics={topics.map((t) => ({
                    ...t,
                    selected: true,
                  }))}
                  onTopicClick={async (t) => {
                    // await navigate(`/topics/${t.id}`)
                    return undefined;
                  }}
                />
                {pipe(
                  O.fromNullable(item.location),
                  O.fold(
                    () => null,
                    () => <FontAwesomeIcon icon={faMapMarker} />
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
                  item.groups,
                  O.fromPredicate((arr) => arr.length > 0),
                  O.map((groupIds) =>
                    groups.filter((a) => groupIds.includes(a.id))
                  ),
                  O.fold(
                    () => null,
                    (groups) => (
                      <GroupList
                        groups={groups.map((g) => ({
                          ...g,
                          selected: false,
                        }))}
                        onGroupClick={async (group) => {
                          // await navigate(`/groups/${group.id}`)
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
                  item.actors,
                  O.fromPredicate((arr) => arr.length > 0),
                  O.map((actorIds) =>
                    actors.filter((a) => actorIds.includes(a.id))
                  ),
                  O.fold(
                    () => null,
                    (actors) => (
                      <ActorList
                        actors={actors.map((a) => ({
                          ...a,
                          selected: false,
                        }))}
                        onActorClick={async (actor) => {
                          // await navigate(`/actors/${actor.id}`)
                          return undefined;
                        }}
                        avatarScale="scale1000"
                      />
                    )
                  )
                )}
              </FlexGridItem>
            </FlexGridItem>

            <FlexGridItem display="flex" flexGridColumnCount={3}>
              <time dateTime={formatDate(eventDate(item))}>
                {formatDate(eventDate(item))}
              </time>
            </FlexGridItem>

            {pipe(
              item.images,
              O.fromPredicate((arr) => arr.length > 0),
              O.map((images) => (
                // eslint-disable-next-line react/jsx-key
                <FlexGridItem>
                  <Slider
                    key="home-slider"
                    height={600}
                    slides={images.map((i) => ({
                      authorName: "",
                      info: i.description,
                      imageURL: i.location,
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
                <MarkdownRenderer>{item.body}</MarkdownRenderer>
                {pipe(
                  item.links,
                  O.fromPredicate((arr) => arr.length > 0),
                  O.map((links) => (
                    // eslint-disable-next-line react/jsx-key
                    <Accordion>
                      <Panel title={`Links (${links.length})`}>
                        <ul>
                          {links.map((l, i) => (
                            <ListItem key={i} artwork={CheckIndeterminate}>
                              <ListItemLabel>
                                <ParagraphSmall>
                                  <a href={l.url}>{l.description}</a>
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
  );
};
