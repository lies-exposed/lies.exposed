import { eqByUUID } from "@econnessione/shared/helpers/event";
import { Actor, Group, Keyword } from "@econnessione/shared/io/http";
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
import { AutocompleteActorInput } from "@econnessione/ui/components/Input/AutocompleteActorInput";
import { AutocompleteGroupInput } from "@econnessione/ui/components/Input/AutocompleteGroupInput";
import { AutocompleteKeywordInput } from "@econnessione/ui/components/Input/AutocompleteKeywordInput";
import { MainContent } from "@econnessione/ui/components/MainContent";
import { PageContent } from "@econnessione/ui/components/PageContent";
import SEO from "@econnessione/ui/components/SEO";
import EventList from "@econnessione/ui/components/lists/EventList/EventList";
import {
  pageContentByPath,
  Queries,
} from "@econnessione/ui/providers/DataProvider";
import { theme } from "@econnessione/ui/theme/index";
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
  groupsMembers: groupsMembersIds = [],
  keywords: keywordIds = [],
  startDate = MIN_DATE,
  endDate = MAX_DATE,
  tab = 0,
}) => {
  return (
    <WithQueries
      queries={{
        page: pageContentByPath,
        actors: Queries.Actor.getList,
        groups: Queries.Group.getList,
        keywords: Queries.Keyword.getList,
      }}
      params={{
        page: {
          path: "events",
        },
        groups: {
          pagination: { page: 1, perPage: 20 },
          sort: { field: "id", order: "ASC" },
          filter: {
            ids: groupIds,
          },
        },
        actors: {
          pagination: { page: 1, perPage: 20 },
          sort: { field: "id", order: "ASC" },
          filter: {
            ids: actorIds,
          },
        },
        keywords: {
          pagination: { page: 1, perPage: 20 },
          sort: { field: "id", order: "ASC" },
          filter: {
            ids: keywordIds,
          },
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
              actors: { data: actors },
              groups: { data: groups },
              keywords: { data: keywords },
            }) => {
              const [dateRange, setDateRange] = React.useState<
                [string, string]
              >([startDate, endDate]);

              const handleDateRangeChange = (range: [string, string]): void => {
                void doUpdateCurrentView({
                  view: "events",
                  actors: actorIds,
                  groups: groupIds,
                  groupsMembers: groupsMembersIds,
                  startDate: range[0],
                  endDate: range[1],
                })();
              };

              const onActorClick = (actor: Actor.Actor): void => {
                const newSelectedActorIds = A.elem(eqByUUID)(actor, actors)
                  ? A.array.filter(actors, (a) => !eqByUUID.equals(a, actor))
                  : actors.concat(actor);

                void doUpdateCurrentView({
                  view: "events",
                  actors: newSelectedActorIds.map((s) => s.id),
                  groups: groupIds,
                  groupsMembers: groupsMembersIds,
                  startDate: dateRange[0],
                  endDate: dateRange[1],
                })();
              };

              const onGroupClick = (g: Group.Group): void => {
                const newSelectedGroupIds = A.elem(eqByUUID)(g, groups)
                  ? A.array.filter(groups, (_) => !eqByUUID.equals(_, g))
                  : groups.concat(g);

                void doUpdateCurrentView({
                  view: "events",
                  actors: actorIds,
                  groups: newSelectedGroupIds.map((s) => s.id),
                })();
              };

              const onKeywordClick = (keyword: Keyword.Keyword): void => {
                const newSelectedKeywords = A.elem(eqByUUID)(keyword, keywords)
                  ? A.array.filter(
                      keywords,
                      (_) => !eqByUUID.equals(_, keyword)
                    )
                  : keywords.concat(keyword);

                void doUpdateCurrentView({
                  view: "events",
                  actors: actorIds,
                  groups: groupIds,
                  groupsMembers: groupsMembersIds,
                  keywords: newSelectedKeywords.map((k) => k.id),
                  startDate: dateRange[0],
                  endDate: dateRange[1],
                })();
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
                        <AutocompleteKeywordInput
                          selectedItems={keywords}
                          onItemClick={onKeywordClick}
                        />
                      </Grid>
                      <Grid item style={{ margin: 10 }}>
                        <AutocompleteGroupInput
                          selectedItems={groups}
                          onItemClick={onGroupClick}
                        />
                      </Grid>
                      <Grid item style={{ margin: 10 }}>
                        <AutocompleteActorInput
                          selectedItems={actors}
                          onItemClick={onActorClick}
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

                        <Grid item md={12}>
                          <Tabs
                            value={tab}
                            onChange={(e, tab) =>
                              doUpdateCurrentView({
                                view: "events",
                                groups: groupIds,
                                actors: actorIds,
                                groupsMembers: groupsMembersIds,
                                keywords: keywordIds,
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
                              events={[]}
                              actors={actors}
                              groups={groups}
                              keywords={keywords}
                              groupBy={"actor"}
                              selectedActorIds={actorIds}
                              selectedGroupIds={groupIds}
                              selectedKeywordIds={keywordIds}
                              scale={"all"}
                              scalePoint={O.none}
                              onEventClick={(e) => {
                                void doUpdateCurrentView({
                                  view: "event",
                                  eventId: e.id,
                                })();
                              }}
                            />
                          </TabPanel>
                          <TabPanel value={tab} index={1}>
                            <EventsMap
                              filter={{
                                actors: O.none,
                                groups: O.none,
                              }}
                              onMapClick={() => {}}
                            />
                          </TabPanel>
                          <TabPanel value={tab} index={2}>
                            <EventList
                              eventFilters={{
                                startDate,
                                endDate,
                                keywords: keywordIds,
                                groups: groupIds,
                                actors: actorIds,
                                groupsMembers: groupsMembersIds,
                                links: [],
                                title: null,
                              }}
                              deathFilters={{
                                minDate: startDate,
                                maxDate: endDate,
                                victim: actorIds,
                              }}
                              actors={actors}
                              groups={groups}
                              keywords={keywords}
                              onClick={(e) => {
                                void doUpdateCurrentView({
                                  view: "event",
                                  eventId: e.id,
                                })();
                              }}
                            />
                          </TabPanel>
                        </Grid>
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
