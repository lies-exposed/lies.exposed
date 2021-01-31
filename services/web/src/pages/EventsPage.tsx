import DatePicker from "@components/Common/DatePicker";
import { ErrorBox } from "@components/Common/ErrorBox";
import { Loader } from "@components/Common/Loader";
import { ContentWithSidebar } from "@components/ContentWithSidebar";
import EventsMap from "@components/EventsMap";
import { MainContent } from "@components/MainContent";
import { PageContent } from "@components/PageContent";
import SEO from "@components/SEO";
import SearchableInput from "@components/SearchableInput";
import { ActorListItem } from "@components/lists/ActorList";
import EventList from "@components/lists/EventList/EventList";
import { GroupListItem } from "@components/lists/GroupList";
import { TopicListItem } from "@components/lists/TopicList";
import { io } from "@econnessione/shared";
import { Actor, Group, Topic } from "@econnessione/shared/lib/io/http";
import { eventDate, ordEventDate } from "@helpers/event";
import {
  actorsList,
  eventsList,
  groupsList,
  pageContentByPath,
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
          actors: actorsList,
          groups: groupsList,
          events: eventsList,
        }}
        params={{
          page: {
            path: "events",
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
          ({
            page,
            events: { data: events, total: totalEvents },
            actors: { data: actors },
            groups: { data: groups },
          }) => {
            const topics: io.http.Topic.TopicFrontmatter[] = [];
            const {
              actors: actorUUIDS = [],
              topics: topicUUIDS = [],
              groups: groupUUIDs = [],
            } = pipe(
              parseSearch(this.props.location, "events"),
              E.getOrElse((): Routes["events"] => ({
                actors: [],
                topics: [],
                groups: [],
              }))
            );

            const [selectedGroups, setSelectedGroups] = React.useState(
              groups.filter((g) => groupUUIDs.includes(g.id))
            );

            const [selectedActors, setSelectedActors] = React.useState(
              actors.filter((a) => actorUUIDS.includes(a.id))
            );
            const [selectedTopics, setSelectedTopicIds] = React.useState(
              topics.filter((t) => topicUUIDS.includes(t.id))
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
                  "events"
                )({ actors: newSelectedActorIds.map((s) => s.id) }),
                E.map(async (url) => {
                  if (this.props.navigate !== undefined) {
                    await this.props.navigate(url);
                  }
                })
              );
            };

            const onGroupClick = (g: Group.Group): void => {
              const newSelectedGroupIds = A.elem(eqByUUID)(g, selectedGroups)
                ? A.array.filter(selectedGroups, (_) => !eqByUUID.equals(_, g))
                : selectedGroups.concat(g);
              setSelectedGroups(newSelectedGroupIds);

              pipe(
                updateSearch(
                  this.props.location,
                  "events"
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
                  "events"
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
              )(eventDate(e));

              const hasActor = GetByGroupOrActorUtils(
                actors,
                groups
              ).isActorInEvent(e, selectedActorIds);

              const hasGroup = GetByGroupOrActorUtils(
                actors,
                groups
              ).isGroupInEvent(e, selectedGroupIds);

              const hasTopic = false;

              return isBetweenDateRange && (hasActor || hasGroup || hasTopic);
            });

            return (
              <FlexGrid
                alignItems="center"
                alignContent="center"
                justifyItems="center"
                height="100%"
                flexGridColumnCount={1}
              >
                <ContentWithSidebar
                  sidebar={
                    <FlexGrid
                      flexGridColumnCount={1}
                      alignItems="start"
                      minHeight="300px"
                      height="100%"
                    >
                      <FlexGridItem display="flex">
                        <DatePicker
                          value={dateRange}
                          range={true}
                          quickSelect={true}
                          onChange={onDatePickerChange}
                        />
                      </FlexGridItem>
                      <FlexGridItem display="flex">
                        <SearchableInput
                          placeholder="Topics..."
                          items={topics.filter(
                            (t) => !selectedTopicIds.includes(t.id)
                          )}
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
                      <FlexGridItem display="flex" flexGridColumnCount={1}>
                        <SearchableInput
                          placeholder="Gruppi..."
                          items={groups.filter(
                            (g) => !selectedGroupIds.includes(g.id)
                          )}
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
                      <FlexGridItem display="flex">
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
                  }
                >
                  <MainContent>
                    <Helmet>
                      <SEO title={page.title} />
                    </Helmet>
                    <FlexGridItem width="100%">
                      <PageContent {...page} />

                      <LabelMedium>Nº Eventi: {totalEvents}</LabelMedium>
                      <EventsMap events={events} width={600} height={400} />
                      <EventList
                        events={events}
                        actors={actors}
                        groups={groups}
                      />
                    </FlexGridItem>
                  </MainContent>
                </ContentWithSidebar>
              </FlexGrid>
            );
          }
        )}
      />
    );
  }
}
