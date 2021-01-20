import DatePicker from "@components/Common/DatePicker";
import { ErrorBox } from "@components/Common/ErrorBox";
import { Loader } from "@components/Common/Loader";
import { ContentWithSideNavigation } from "@components/ContentWithSideNavigation";
import { Layout } from "@components/Layout";
import { MainContent } from "@components/MainContent";
import { PageContent } from "@components/PageContent";
import SEO from "@components/SEO";
import SearchableInput from "@components/SearchableInput";
import { ActorListItem } from "@components/lists/ActorList";
import EventList from "@components/lists/EventList/EventList";
import { GroupListItem } from "@components/lists/GroupList";
import { TopicListItem } from "@components/lists/TopicList";
import { Actor, Group, Topic } from "@econnessione/shared/lib/io/http";
import { eventsDataToNavigatorItems, ordEventDate } from "@helpers/event";
import {
  actorsList,
  eventsList,
  groupsList,
  pageContentByPath,
  topicsList,
} from "@providers/DataProvider";
import { RouteComponentProps } from "@reach/router";
import theme from "@theme/CustomeTheme";
import { GetByGroupOrActorUtils } from "@utils/ByGroupOrActorUtils";
import { eqByUUID } from "@utils/IOTSSchemable";
import { parseSearch, Routes, updateSearch } from "@utils/routes";
import * as QR from "avenger/lib/QueryResult";
import { WithQueries } from "avenger/lib/react";
import { FlexGrid, FlexGridItem } from "baseui/flex-grid";
import { LabelMedium } from "baseui/typography";
import { subYears } from "date-fns";
import * as A from "fp-ts/lib/Array";
import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import * as Ord from "fp-ts/lib/Ord";
import { pipe } from "fp-ts/lib/pipeable";
import React from "react";
import Helmet from "react-helmet";

export default class EventsPage extends React.PureComponent<RouteComponentProps> {
  render(): JSX.Element {
    return (
      <WithQueries
        queries={{
          page: pageContentByPath,
          topics: topicsList,
          actors: actorsList,
          groups: groupsList,
          events: eventsList,
        }}
        params={{
          page: {
            path: "timelines",
          },
          topics: {
            pagination: { page: 1, perPage: 20 },
            sort: { field: "id", order: "ASC" },
            filter: {},
          },
          groups: {
            pagination: { page: 1, perPage: 20 },
            sort: { field: "id", order: "ASC" },
            filter: {},
          },
          actors: {
            pagination: { page: 1, perPage: 20 },
            sort: { field: "id", order: "ASC" },
            filter: {},
          },
          events: {
            pagination: { page: 1, perPage: 20 },
            sort: { field: "id", order: "ASC" },
            filter: {},
          },
        }}
        render={QR.fold(
          Loader,
          ErrorBox,
          ({ page, events, actors, topics, groups }) => {
            const {
              actors: actorUUIDS = [],
              topics: topicUUIDS = [],
              groups: groupUUIDs = [],
            } = pipe(
              parseSearch(this.props.location, "timelines"),
              E.getOrElse((): Routes["timelines"] => ({
                actors: [],
                topics: [],
                groups: [],
              }))
            );

            const [selectedGroups, setSelectedGroups] = React.useState(
              groups
                .filter((g) => groupUUIDs.includes(g.id))
                .map((_) => _.frontmatter)
            );

            const [selectedActors, setSelectedActors] = React.useState(
              actors.filter((a) => actorUUIDS.includes(a.id))
            );
            const [selectedTopics, setSelectedTopicIds] = React.useState(
              topics
                .filter((t) => topicUUIDS.includes(t.id))
                .map((_) => _.frontmatter)
            );

            const selectedActorIds = selectedActors.map((a) => a.id);
            const selectedGroupIds = selectedGroups.map((g) => g.id);
            const selectedTopicIds = selectedTopics.map((t) => t.id);

            const [dateRange, setDateRange] = React.useState<Date[]>([
              subYears(new Date(), 10),
              new Date(),
            ]);

            const onActorClick = (actor: Actor.Actor): void => {
              const newSelectedActorIds = A.elem(eqByUUID)(
                actor,
                selectedActors
              )
                ? A.array.filter(
                    selectedActors,
                    (a) => !eqByUUID.equals(a, actor)
                  )
                : selectedActors.concat(actor);
              setSelectedActors(newSelectedActorIds);

              pipe(
                updateSearch(
                  this.props.location,
                  "timelines"
                )({ actors: newSelectedActorIds.map((s) => s.id) }),
                E.map(async (url) => {
                  if (this.props.navigate !== undefined) {
                    await this.props.navigate(url);
                  }
                })
              );
            };

            const onGroupClick = (g: Group.GroupFrontmatter): void => {
              const newSelectedGroupIds = A.elem(eqByUUID)(g, selectedGroups)
                ? A.array.filter(selectedGroups, (_) => !eqByUUID.equals(_, g))
                : selectedGroups.concat(g);
              setSelectedGroups(newSelectedGroupIds);

              pipe(
                updateSearch(
                  this.props.location,
                  "timelines"
                )({ groups: newSelectedGroupIds.map((s) => s.id) }),
                E.map(async (url) => {
                  if (this.props.navigate !== undefined) {
                    await this.props.navigate(url);
                  }
                })
              );
            };

            const onTopicClick = (topic: Topic.TopicFrontmatter): void => {
              const newSelectedTopics = A.elem(eqByUUID)(topic, selectedTopics)
                ? A.array.filter(
                    selectedTopics,
                    (_) => !eqByUUID.equals(_, topic)
                  )
                : selectedTopics.concat(topic);

              setSelectedTopicIds(newSelectedTopics);

              pipe(
                updateSearch(
                  this.props.location,
                  "timelines"
                )({ topics: newSelectedTopics.map((s) => s.id) }),
                E.map(async (url) => {
                  if (this.props.navigate !== undefined) {
                    await this.props.navigate(url);
                  }
                })
              );
            };

            const onDatePickerChange = (value: {
              date: Date | Date[];
            }): void => {
              if (Array.isArray(value.date)) {
                setDateRange(value.date);
              }
            };

            const minDate = dateRange[0];
            const maxDate = pipe(
              O.fromNullable(dateRange[1]),
              O.getOrElse(() => new Date())
            );

            const filteredEvents = A.sort(Ord.getDualOrd(ordEventDate))(
              events
            ).filter((e) => {
              const isBetweenDateRange = Ord.between(Ord.ordDate)(
                minDate,
                maxDate
              )(e.date);

              const hasActor = GetByGroupOrActorUtils(actors, groups).isActorInEvent(
                e,
                selectedActorIds
              );

              const hasGroup = GetByGroupOrActorUtils(actors, groups).isGroupInEvent(
                e,
                selectedGroupIds
              );

              const hasTopic = false;

              return isBetweenDateRange && (hasActor || hasGroup || hasTopic);
            });

            return (
              <Layout>
                <Helmet>
                  <SEO title={page.title} />
                </Helmet>
                <FlexGrid
                  alignItems="center"
                  alignContent="center"
                  justifyItems="center"
                  flexGridColumnCount={1}
                >
                  <FlexGridItem width="100%">
                    <MainContent>
                      <PageContent {...page} />
                    </MainContent>

                    <FlexGrid
                      flexGridColumnCount={4}
                      alignItems="start"
                      height="300px"
                    >
                      <FlexGridItem height="100%" display="flex">
                        <DatePicker
                          value={dateRange}
                          range={true}
                          quickSelect={true}
                          onChange={onDatePickerChange}
                        />
                      </FlexGridItem>
                      <FlexGridItem height="100%" display="flex">
                        <SearchableInput
                          placeholder="Topics..."
                          items={topics
                            .filter((t) => !selectedTopicIds.includes(t.id))
                            .map((_) => _.frontmatter)}
                          selectedItems={selectedTopics}
                          getValue={(item) => item.label}
                          itemRenderer={(item, itemProps, index) => (
                            <TopicListItem
                              $theme={theme}
                              key={item.id}
                              index={index}
                              item={{
                                ...item,
                                selected: selectedTopics.some((t) =>
                                  eqByUUID.equals(t, item)
                                ),
                              }}
                              onClick={(item) => itemProps.onClick(item)}
                            />
                          )}
                          onSelectItem={(item, items) => {
                            onTopicClick(item);
                          }}
                          onUnselectItem={(item) => onTopicClick(item)}
                        />
                      </FlexGridItem>
                      <FlexGridItem
                        height="100%"
                        display="flex"
                        flexGridColumnCount={1}
                      >
                        <SearchableInput
                          placeholder="Gruppi..."
                          items={groups
                            .filter((g) => !selectedGroupIds.includes(g.id))
                            .map((_) => _.frontmatter)}
                          selectedItems={selectedGroups}
                          itemRenderer={(item, itemProps, index) => {
                            return (
                              <GroupListItem
                                key={item.id}
                                index={index}
                                item={{
                                  ...item,
                                  selected: selectedGroups.some((g) =>
                                    eqByUUID.equals(g, item)
                                  ),
                                }}
                                onClick={(item) => itemProps.onClick(item)}
                                avatarScale="scale1000"
                              />
                            );
                          }}
                          onSelectItem={(item) => {
                            onGroupClick(item);
                          }}
                          onUnselectItem={(item) => {
                            onGroupClick(item);
                          }}
                          getValue={(item) => item.name}
                        />
                      </FlexGridItem>
                      <FlexGridItem height="100%" display="flex">
                        <SearchableInput
                          placeholder="Attori..."
                          items={actors.filter(
                            (a) => !selectedActorIds.includes(a.id)
                          )}
                          selectedItems={selectedActors}
                          itemRenderer={(item, itemProps, index) => {
                            return (
                              <ActorListItem
                                key={item.id}
                                index={index}
                                item={{
                                  ...item,
                                  selected: selectedActors.some((a) =>
                                    eqByUUID.equals(a, item)
                                  ),
                                }}
                                onClick={(item) => itemProps.onClick(item)}
                                avatarScale="scale1000"
                              />
                            );
                          }}
                          onSelectItem={(item) => onActorClick(item)}
                          onUnselectItem={(item) => onActorClick(item)}
                          getValue={(item) => item.username}
                        />
                      </FlexGridItem>
                    </FlexGrid>
                    <LabelMedium>
                      Nº Eventi: {filteredEvents.length}
                    </LabelMedium>
                  </FlexGridItem>
                  <FlexGridItem>
                    <ContentWithSideNavigation
                      items={eventsDataToNavigatorItems(filteredEvents)}
                    >
                      <EventList events={filteredEvents as any} />
                    </ContentWithSideNavigation>
                  </FlexGridItem>
                </FlexGrid>
              </Layout>
            );
          }
        )}
      />
    );
  }
}
