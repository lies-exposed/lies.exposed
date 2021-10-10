import { eqByUUID } from "@econnessione/shared/helpers/event";
import * as io from "@econnessione/shared/io";
import { Actor, Group, Topic } from "@econnessione/shared/io/http";
import DatePicker from "@econnessione/ui/components/Common/DatePicker";
import { ErrorBox } from "@econnessione/ui/components/Common/ErrorBox";
import { LazyFullSizeLoader } from "@econnessione/ui/components/Common/FullSizeLoader";
import {
  a11yProps,
  TabPanel,
} from "@econnessione/ui/components/Common/TabPanel";
import { ContentWithSidebar } from "@econnessione/ui/components/ContentWithSidebar";
import { EventsMap } from "@econnessione/ui/components/EventsMap";
import { EventsNetworkGraph } from "@econnessione/ui/components/Graph/EventsNetworkGraph";
import { MainContent } from "@econnessione/ui/components/MainContent";
import { PageContent } from "@econnessione/ui/components/PageContent";
import SEO from "@econnessione/ui/components/SEO";
import SearchableInput from "@econnessione/ui/components/SearchableInput";
import {
  ActorList,
  ActorListItem,
} from "@econnessione/ui/components/lists/ActorList";
import EventList from "@econnessione/ui/components/lists/EventList/EventList";
import GroupList, {
  GroupListItem,
} from "@econnessione/ui/components/lists/GroupList";
import { TopicListItem } from "@econnessione/ui/components/lists/TopicList";
import {
  pageContentByPath,
  Queries,
} from "@econnessione/ui/providers/DataProvider";
import { theme } from "@econnessione/ui/theme/index";
import { Uncategorized } from "@io/http/Events/Uncategorized";
import { Box, Chip, Grid, Tab, Tabs, Typography } from "@material-ui/core";
import * as QR from "avenger/lib/QueryResult";
import { WithQueries } from "avenger/lib/react";
import { formatISO, subYears } from "date-fns";
import * as A from "fp-ts/lib/Array";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import * as React from "react";
import * as Helmet from "react-helmet";
import { doUpdateCurrentView, EventsView } from "../utils/location.utils";

const MIN_DATE = formatISO(subYears(new Date(), 10), {
  representation: "date",
});
const MAX_DATE = formatISO(new Date(), { representation: "date" });

interface EventsPageProps extends EventsView {}

const EventsPage: React.FC<EventsPageProps> = ({
  actors: actorIds = [],
  groups: groupIds = [],
  startDate = MIN_DATE,
  endDate = MAX_DATE,
  tab = 0,
}) => {
  const topics: io.http.Topic.TopicFrontmatter[] = [];

  return (
    <WithQueries
      queries={{
        page: pageContentByPath,
        actors: Queries.Actor.getList,
        groups: Queries.Group.getList,
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
        deaths: {
          pagination: { page: 1, perPage: 20 },
          sort: { field: "date", order: "DESC" },
          filter: {},
        },
      }}
      render={(r) =>
        pipe(
          r,
          QR.fold(
            LazyFullSizeLoader,
            ErrorBox,
            ({
              page,
              deaths,
              actors: { data: actors },
              groups: { data: groups },
            }) => {
              const selectedGroups = React.useMemo(
                () => groups.filter((g) => groupIds.includes(g.id)),
                groups
              );

              const selectedActors = React.useMemo(
                () => actors.filter((a) => actorIds.includes(a.id)),
                actors
              );

              const selectedTopics = React.useMemo(() => topics, topics);

              const selectedActorIds = selectedActors.map((a) => a.id);
              const selectedGroupIds = selectedGroups.map((g) => g.id);
              const selectedTopicIds = selectedTopics.map((t) => t.id);

              const [dateRange, setDateRange] = React.useState<
                [string, string]
              >([startDate, endDate]);

              const handleDateRangeChange = (range: [string, string]): void => {
                void doUpdateCurrentView({
                  view: "events",
                  startDate: range[0],
                  endDate: range[1],
                })();
              };

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
                // setSelectedActors(newSelectedActorIds);

                void doUpdateCurrentView({
                  view: "events",
                  actors: newSelectedActorIds.map((s) => s.id),
                  groups: groupIds,
                })();
              };

              const onGroupClick = (g: Group.Group): void => {
                const newSelectedGroupIds = A.elem(eqByUUID)(g, selectedGroups)
                  ? A.array.filter(
                      selectedGroups,
                      (_) => !eqByUUID.equals(_, g)
                    )
                  : selectedGroups.concat(g);
                // setSelectedGroups(newSelectedGroupIds);

                void doUpdateCurrentView({
                  view: "events",
                  actors: actorIds,
                  groups: newSelectedGroupIds.map((s) => s.id),
                })();
              };

              const onTopicClick = (topic: Topic.TopicFrontmatter): void => {
                const newSelectedTopics = A.elem(eqByUUID)(
                  topic,
                  selectedTopics
                )
                  ? A.array.filter(
                      selectedTopics,
                      (_) => !eqByUUID.equals(_, topic)
                    )
                  : selectedTopics.concat(topic);
              };

              return (
                <ContentWithSidebar
                  defaultOpen={true}
                  sidebar={
                    <Grid container direction="column">
                      <Grid item style={{ margin: 10 }}>
                        <Grid container>
                          <Grid item md={6}>
                            <DatePicker
                              size="small"
                              value={dateRange[0]}
                              variant="outlined"
                              onChange={(e) =>
                                setDateRange([e.target.value, dateRange[1]])
                              }
                              onBlur={(e) => {
                                handleDateRangeChange([
                                  e.target.value,
                                  dateRange[1],
                                ]);
                              }}
                              style={{ width: "100%" }}
                            />
                          </Grid>
                          <Grid item md={6}>
                            <DatePicker
                              size="small"
                              value={endDate}
                              variant="outlined"
                              onChange={(e) =>
                                setDateRange([dateRange[0], e.target.value])
                              }
                              onBlur={(e) =>
                                handleDateRangeChange([
                                  dateRange[0],
                                  e.target.value,
                                ])
                              }
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
                          disablePortal={true}
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
                          disablePortal={true}
                          renderTags={(item, getTagProps) => {
                            return (
                              <GroupList
                                onGroupClick={() => {}}
                                groups={item.map((i) => ({
                                  ...i,
                                  selected: true,
                                }))}
                              />
                            );
                          }}
                          renderOption={(item, state) => {
                            return (
                              <GroupListItem
                                key={item.id}
                                displayName={true}
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
                          disablePortal={true}
                          renderTags={(item, getTagProps) => {
                            return (
                              <ActorList
                                actors={item.map((a) => ({
                                  ...a,
                                  selected: true,
                                }))}
                                displayFullName={false}
                                onActorClick={(a) => {
                                  onActorClick(a);
                                }}
                              />
                            );
                          }}
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
                      </Grid>
                    </Grid>
                  }
                >
                  <MainContent>
                    <Helmet.Helmet>
                      <SEO title={page.title} />
                    </Helmet.Helmet>
                    <Grid item>
                      <Grid container>
                        <Grid item md={12}>
                          <PageContent {...page} />
                        </Grid>

                        <WithQueries
                          queries={{ events: Queries.Event.getList }}
                          params={{
                            events: {
                              pagination: { page: 1, perPage: 100 },
                              sort: { field: "startDate", order: "DESC" },
                              filter: {
                                startDate,
                                endDate,
                                groups: groupIds,
                                actors: actorIds,
                              },
                            },
                          }}
                          render={QR.fold(
                            LazyFullSizeLoader,
                            ErrorBox,
                            ({ events }) => {
                              return (
                                <Grid item md={12}>
                                  <Grid item md={6}>
                                    <Box>
                                      <Typography variant="caption">
                                        Nº Eventi:{" "}
                                        <Typography
                                          display="inline"
                                          variant="subtitle1"
                                        >
                                          {events.total}
                                        </Typography>{" "}
                                        dal {startDate} al {endDate}{" "}
                                      </Typography>
                                    </Box>
                                  </Grid>
                                  <Grid container md={6}>
                                    <Box margin={1}>
                                      <Chip
                                        label={`Uncategorized (${events.total})`}
                                      />
                                    </Box>
                                    <Box margin={1}>
                                      <Chip
                                        label={`Deaths (${deaths.total})`}
                                        style={{
                                          backgroundColor:
                                            theme.palette.common.black,
                                          color: theme.palette.common.white,
                                        }}
                                      />
                                    </Box>
                                  </Grid>
                                  <Tabs
                                    value={tab}
                                    onChange={(e, tab) =>
                                      doUpdateCurrentView({
                                        view: "events",
                                        groups: groupIds,
                                        actors: actorIds,
                                        tab,
                                      })()
                                    }
                                  >
                                    <Tab label="network" {...a11yProps(0)} />
                                    <Tab label="map" {...a11yProps(1)} />
                                    <Tab label="list" {...a11yProps(2)} />
                                  </Tabs>

                                  <TabPanel value={tab} index={0}>
                                    <EventsNetworkGraph
                                      events={events.data.filter(
                                        Uncategorized.is
                                      )}
                                      actors={selectedActors}
                                      groups={selectedGroups}
                                      groupBy={"actor"}
                                      selectedActorIds={selectedActorIds}
                                      selectedGroupIds={selectedGroupIds}
                                      selectedTopicIds={selectedTopicIds}
                                      scale={"all"}
                                      scalePoint={O.none}
                                      onEventClick={async (e) => {
                                        // if (this.props.navigate) {
                                        //   await this.props.navigate(
                                        //     `/events/${e.id}`
                                        //   );
                                        // }
                                      }}
                                    />
                                  </TabPanel>
                                  <TabPanel value={tab} index={1}>
                                    <EventsMap
                                      filter={{
                                        actors: O.none,
                                        groups: O.none,
                                      }}
                                    />
                                  </TabPanel>
                                  <TabPanel value={tab} index={2}>
                                    <EventList
                                      events={events.data as any}
                                      actors={actors}
                                      groups={groups}
                                    />
                                  </TabPanel>
                                </Grid>
                              );
                            }
                          )}
                        />
                      </Grid>
                    </Grid>
                  </MainContent>
                </ContentWithSidebar>
              );
            }
          )
        )
      }
    />
  );
};

export default EventsPage;
