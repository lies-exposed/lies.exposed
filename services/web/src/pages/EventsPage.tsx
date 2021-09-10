import { a11yProps, TabPanel } from "@components/Common/TabPanel";
import { EventsNetworkGraph } from "@components/Graph/EventsNetworkGraph";
import DatePicker from "@econnessione/shared/components/Common/DatePicker";
import { ErrorBox } from "@econnessione/shared/components/Common/ErrorBox";
import { LazyFullSizeLoader } from "@econnessione/shared/components/Common/FullSizeLoader";
import { ContentWithSidebar } from "@econnessione/shared/components/ContentWithSidebar";
import { EventsMap } from "@econnessione/shared/components/EventsMap";
import { MainContent } from "@econnessione/shared/components/MainContent";
import { PageContent } from "@econnessione/shared/components/PageContent";
import SEO from "@econnessione/shared/components/SEO";
import SearchableInput from "@econnessione/shared/components/SearchableInput";
import {
  ActorList,
  ActorListItem,
} from "@econnessione/shared/components/lists/ActorList";
import EventList from "@econnessione/shared/components/lists/EventList/EventList";
import { GroupListItem } from "@econnessione/shared/components/lists/GroupList";
import { TopicListItem } from "@econnessione/shared/components/lists/TopicList";
import {
  eqByUUID,
  eventDate,
  ordEventDate,
} from "@econnessione/shared/helpers/event";
import * as io from "@econnessione/shared/io";
import { Actor, Group, Topic } from "@econnessione/shared/io/http";
import {
  pageContentByPath,
  Queries,
} from "@econnessione/shared/providers/DataProvider";
import { GetByGroupOrActorUtils } from "@econnessione/shared/utils/ByGroupOrActorUtils";
import { formatDate } from "@econnessione/shared/utils/date";
import {
  parseSearch,
  Routes,
  updateSearch,
} from "@econnessione/shared/utils/routes";
import { Uncategorized } from "@io/http/Events/Uncategorized";
import { Box, Chip, Grid, Tab, Tabs, Typography } from "@material-ui/core";
import { RouteComponentProps } from "@reach/router";
import { theme } from "@theme/index";
import * as QR from "avenger/lib/QueryResult";
import { WithQueries } from "avenger/lib/react";
import { subYears } from "date-fns";
import * as A from "fp-ts/lib/Array";
import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import * as Ord from "fp-ts/lib/Ord";
import { pipe } from "fp-ts/lib/pipeable";
import * as qs from "query-string";
import React from "react";
import Helmet from "react-helmet";

export default class EventsPage extends React.PureComponent<RouteComponentProps> {
  state: { viewTab: number } = { viewTab: 0 };

  render(): JSX.Element {
    const queryFilters = pipe(
      O.fromNullable(this.props.location?.search),
      O.map((s) => qs.parse(s.replace("?", ""), { arrayFormat: "comma" })),
      O.fold(
        () => ({
          groups: O.none,
          actors: O.none,
        }),
        (p) => {
          return {
            groups: pipe(
              O.fromNullable(p.groups),
              O.filter((a) => a !== ""),
              O.map((g) => (typeof g === "string" ? [g] : g))
            ),
            actors: pipe(
              O.fromNullable(p.actors),
              O.filter((a) => a !== ""),
              O.map((a) => (typeof a === "string" ? [a] : a))
            ),
          };
        }
      )
    );

    const setQuery = updateSearch("dashboards/events");

    const handleChange = (event: any, newValue: number): void => {
      this.setState({
        viewTab: newValue,
      });
    };

    return (
      <WithQueries
        queries={{
          page: pageContentByPath,
          actors: Queries.Actor.getList,
          groups: Queries.Group.getList,
          events: Queries.Event.getList,
          deaths: Queries.DeathEvent.getList,
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
            pagination: { page: 1, perPage: 100 },
            sort: { field: "startDate", order: "DESC" },
            filter: {
              ...(O.isSome(queryFilters.groups)
                ? { groups: queryFilters.groups.value }
                : {}),
              ...(O.isSome(queryFilters.actors)
                ? { actors: queryFilters.actors.value }
                : {}),
            },
          },
          deaths: {
            pagination: { page: 1, perPage: 20 },
            sort: { field: "date", order: "DESC" },
            filter: {},
          },
        }}
        render={QR.fold(
          LazyFullSizeLoader,
          ErrorBox,
          ({
            page,
            events,
            deaths,
            actors: { data: actors },
            groups: { data: groups },
          }) => {
            const topics: io.http.Topic.TopicFrontmatter[] = [];
            const {
              actors: actorUUIDS = [],
              topics: topicUUIDS = [],
              groups: groupUUIDs = [],
            } = pipe(
              parseSearch(this.props.location, "dashboards/events"),
              E.getOrElse((): Routes["dashboards/events"] => ({
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

              // pipe(
              //   setQuery(this.props.location, {
              //     actors: newSelectedActorIds.map((s) => s.id)
              //   }),
              //   E.map(async (url) => {
              //     if (this.props.navigate !== undefined) {
              //       await this.props.navigate(url);
              //     }
              //   })
              // );
            };

            const onGroupClick = (g: Group.Group): void => {
              const newSelectedGroupIds = A.elem(eqByUUID)(g, selectedGroups)
                ? A.array.filter(selectedGroups, (_) => !eqByUUID.equals(_, g))
                : selectedGroups.concat(g);
              setSelectedGroups(newSelectedGroupIds);

              // pipe(
              //   setQuery(this.props.location, {
              //     groups: newSelectedGroupIds.map((s) => s.id)
              //   }),
              //   E.map(async (url) => {
              //     if (this.props.navigate !== undefined) {
              //       await this.props.navigate(url);
              //     }
              //   })
              // );
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
                setQuery(this.props.location, {
                  topics: newSelectedTopics.map((s) => s.id),
                }),
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
              events.data
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
                    <Grid item style={{ margin: 10 }}>
                      <Grid container>
                        <Grid item md={6}>
                          <DatePicker
                            size="small"
                            value={dateRange}
                            variant="outlined"
                            onChange={onDatePickerChange}
                            style={{ width: "100%" }}
                          />
                        </Grid>
                        <Grid item md={6}>
                          <DatePicker
                            size="small"
                            value={dateRange}
                            variant="outlined"
                            onChange={onDatePickerChange}
                            style={{ width: "100%" }}
                          />
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid item style={{ margin: 10 }}>
                      <SearchableInput<Topic.TopicFrontmatter>
                        placeholder="Topics..."
                        label="Topics"
                        items={topics.filter(
                          (t) => !selectedTopicIds.includes(t.id)
                        )}
                        getValue={(t) => t.slug}
                        selectedItems={selectedTopics}
                        renderOption={(item, state) => (
                          <TopicListItem
                            key={item.id}
                            item={{
                              ...item,
                              selected: selectedTopics.some((t) =>
                                eqByUUID.equals(t, item)
                              ),
                            }}
                          />
                        )}
                        onSelectItem={(item, items) => {
                          onTopicClick(item);
                        }}
                        onUnselectItem={(item) => onTopicClick(item)}
                      />
                    </Grid>
                    <Grid item style={{ margin: 10 }}>
                      <SearchableInput<Group.Group>
                        placeholder="Gruppi..."
                        label="Gruppi"
                        items={groups.filter(
                          (g) => !selectedGroupIds.includes(g.id)
                        )}
                        getValue={(g) => g.name}
                        selectedItems={selectedGroups}
                        multiple={true}
                        renderOption={(item, state) => {
                          return (
                            <GroupListItem
                              key={item.id}
                              item={{
                                ...item,
                                selected: selectedGroups.some((g) =>
                                  eqByUUID.equals(g, item)
                                ),
                              }}
                            />
                          );
                        }}
                        onSelectItem={(item) => {
                          onGroupClick(item);
                        }}
                        onUnselectItem={(item) => {
                          onGroupClick(item);
                        }}
                      />
                    </Grid>
                    <Grid item style={{ margin: 10 }}>
                      <SearchableInput<Actor.Actor>
                        placeholder="Attori..."
                        label="Attori"
                        items={actors.filter(
                          (a) => !selectedActorIds.includes(a.id)
                        )}
                        getValue={(a) => a.fullName}
                        selectedItems={selectedActors}
                        multiple={true}
                        renderOption={(item, state) => {
                          return (
                            <ActorListItem
                              key={item.id}
                              displayFullName={true}
                              item={{
                                ...item,
                                selected: true,
                              }}
                            />
                          );
                        }}
                        onSelectItem={(item) => onActorClick(item)}
                        onUnselectItem={(item) => onActorClick(item)}
                      />
                      <ActorList
                        actors={selectedActors.map((a) => ({
                          ...a,
                          selected: true,
                        }))}
                        onActorClick={() => {}}
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
                    <Grid container>
                      <Grid item md={12}>
                        <PageContent {...page} />
                      </Grid>

                      <Grid item md={6}>
                        <Box>
                          <Typography variant="caption">
                            Nº Eventi:{" "}
                            <Typography display="inline" variant="body2">
                              {events.total}
                            </Typography>{" "}
                            dal {formatDate(minDate)} al {formatDate(maxDate)}{" "}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item md={6}>
                        <Box>
                          <Chip label={`Uncategorized (${events.total})`} />
                          <Chip
                            label={`Deaths (${deaths.total})`}
                            style={{
                              backgroundColor: theme.palette.common.black,
                              color: theme.palette.common.white,
                            }}
                          />
                        </Box>
                      </Grid>
                    </Grid>

                    <Tabs value={this.state.viewTab} onChange={handleChange}>
                      <Tab label="network" {...a11yProps(0)} />
                      <Tab label="map" {...a11yProps(1)} />
                      <Tab label="list" {...a11yProps(2)} />
                    </Tabs>

                    <TabPanel value={this.state.viewTab} index={0}>
                      <EventsNetworkGraph
                        events={events.data.filter(Uncategorized.is)}
                        actors={actors}
                        groups={groups}
                        groupBy={"actor"}
                        selectedActorIds={selectedActorIds}
                        selectedGroupIds={selectedGroupIds}
                        selectedTopicIds={selectedTopicIds}
                        scale={"all"}
                        scalePoint={O.none}
                        onEventClick={async (e) => {
                          if (this.props.navigate) {
                            await this.props.navigate(`/events/${e.id}`);
                          }
                        }}
                      />
                    </TabPanel>
                    <TabPanel value={this.state.viewTab} index={1}>
                      <EventsMap filter={{ actors: O.none, groups: O.none }} />
                    </TabPanel>
                    <TabPanel value={this.state.viewTab} index={2}>
                      <EventList
                        events={events.data as any}
                        actors={actors}
                        groups={groups}
                      />
                    </TabPanel>
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
