import { io } from "@econnessione/shared";
import DatePicker from "@econnessione/shared/components/Common/DatePicker";
import { ErrorBox } from "@econnessione/shared/components/Common/ErrorBox";
import { Loader } from "@econnessione/shared/components/Common/Loader";
import { ContentWithSidebar } from "@econnessione/shared/components/ContentWithSidebar";
import EventsMap from "@econnessione/shared/components/EventsMap";
import { MainContent } from "@econnessione/shared/components/MainContent";
import { PageContent } from "@econnessione/shared/components/PageContent";
import SEO from "@econnessione/shared/components/SEO";
import SearchableInput from "@econnessione/shared/components/SearchableInput";
import { ActorListItem } from "@econnessione/shared/components/lists/ActorList";
import EventList from "@econnessione/shared/components/lists/EventList/EventList";
import { GroupListItem } from "@econnessione/shared/components/lists/GroupList";
import { TopicListItem } from "@econnessione/shared/components/lists/TopicList";
import {
  eventDate,
  ordEventDate,
  eqByUUID,
} from "@econnessione/shared/helpers/event";
import { Actor, Group, Topic } from "@econnessione/shared/lib/io/http";
import { GetByGroupOrActorUtils } from "@econnessione/shared/utils/ByGroupOrActorUtils";
import { formatDate } from "@econnessione/shared/utils/date";
import {
  parseSearch,
  Routes,
  updateSearch,
} from "@econnessione/shared/utils/routes";
import { Grid } from "@material-ui/core";
import {
  actorsList,
  eventsList,
  groupsList,
  pageContentByPath,
} from "@providers/DataProvider";
import { RouteComponentProps } from "@reach/router";
import * as QR from "avenger/lib/QueryResult";
import { WithQueries } from "avenger/lib/react";
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

            const onDatePickerChange = (value: any): void => {
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
              events as any
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
              <ContentWithSidebar
                sidebar={
                  <Grid container direction="column">
                    <Grid item>
                      <DatePicker
                        value={dateRange}
                        // range={true}
                        // quickSelect={true}
                        onChange={onDatePickerChange}
                      />
                    </Grid>
                    <Grid item>
                      <SearchableInput
                        placeholder="Topics..."
                        items={topics.filter(
                          (t) => !selectedTopicIds.includes(t.id)
                        )}
                        selectedItems={selectedTopics}
                        getValue={(item) => item.label}
                        itemRenderer={(item, itemProps, index) => (
                          <TopicListItem
                            key={item.id}
                            index={index}
                            item={{
                              ...item,
                              selected: selectedTopics.some((t) =>
                                eqByUUID.equals(t, item)
                              ),
                            }}
                            onClick={(item: any) => itemProps.onClick(item)}
                          />
                        )}
                        onSelectItem={(item, items) => {
                          onTopicClick(item);
                        }}
                        onUnselectItem={(item) => onTopicClick(item)}
                      />
                    </Grid>
                    <Grid item>
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
                              onClick={(item: any) => itemProps.onClick(item)}
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
                    </Grid>
                    <Grid item>
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
                              onClick={(item: any) => itemProps.onClick(item)}
                              avatarScale="scale1000"
                            />
                          );
                        }}
                        onSelectItem={(item) => onActorClick(item)}
                        onUnselectItem={(item) => onActorClick(item)}
                        getValue={(item) => item.username}
                      />
                    </Grid>
                  </Grid>
                }
              >
                <MainContent>
                  <Helmet>
                    <SEO title={page.title} />
                  </Helmet>
                  <Grid item>
                    <PageContent {...page} />

                    <label>
                      Nº Eventi: {totalEvents} dal {formatDate(minDate)} al{" "}
                      {formatDate(maxDate)}{" "}
                    </label>
                    {/* <EventsNetwork
                        events={events}
                        actors={actors}
                        groups={groups}
                        groupBy={'group'}
                        selectedActorIds={selectedActorIds}
                        selectedGroupIds={selectedGroupIds}
                        selectedTopicIds={selectedTopicIds}
                        scale={'all'}
                        scalePoint={O.none}
                      /> */}
                    <EventsMap
                      events={events as any}
                      width={600}
                      height={400}
                    />
                    <EventList
                      events={events as any}
                      actors={actors}
                      groups={groups}
                    />
                  </Grid>
                </MainContent>
              </ContentWithSidebar>
            );
          }
        )}
      />
    );
  }
}
