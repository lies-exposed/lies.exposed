import { GetSearchEVentsQueryInput } from "@econnessione/shared/io/http/Events/SearchEventsQuery";
import { ErrorBox } from "@econnessione/ui/components/Common/ErrorBox";
import { LazyFullSizeLoader } from "@econnessione/ui/components/Common/FullSizeLoader";
import {
  a11yProps,
  TabPanel,
} from "@econnessione/ui/components/Common/TabPanel";
import EventsMap from "@econnessione/ui/components/EventsMap";
import EventsTimeline from "@econnessione/ui/src/components/lists/EventList/EventsTimeline";
import {
  actorsDiscreteQuery,
  groupsDiscreteQuery,
  groupsMembersDiscreteQuery,
  keywordsDiscreteQuery,
} from "@econnessione/ui/state/queries/DiscreteQueries";
import {
  SearchEventQueryResult,
  searchEventsQuery,
} from "@econnessione/ui/state/queries/SearchEventsQuery";
import { ECOTheme } from "@econnessione/ui/theme";
import {
  Box,
  createStyles,
  Drawer,
  Grid,
  Hidden,
  makeStyles,
  Tab,
  Tabs,
  Toolbar,
} from "@material-ui/core";
import * as QR from "avenger/lib/QueryResult";
import { WithQueries } from "avenger/lib/react";
import clsx from "clsx";
import { number } from "fp-ts";
import * as O from "fp-ts/lib/Option";
import qs from "qs";
import * as React from "react";
import { useHistory } from "react-router-dom";
import { IndexRange } from "react-virtualized";
import EventsAppBar from "../components/events/EventsAppBar";
import EventsFilter from "../components/events/EventsFilter";
import EventsFilterSummary from "../components/events/EventsFiltersSummary";
import EventsTotals from "../components/events/EventsTotals";
import {
  CurrentView,
  doUpdateCurrentView,
  EventsView,
  useNavigate,
  useRouteQuery,
} from "../utils/location.utils";
import { EventsNetwork } from "./EventsNetwork";

const drawerWidth = 240;

const useStyles = makeStyles((theme: ECOTheme) =>
  createStyles({
    root: {
      display: "flex",
      flexDirection: "row",
      [theme.breakpoints.down("md")]: {
        flexDirection: "column",
      },
    },
    menuButton: {
      marginRight: 36,
    },
    hide: {
      display: "none",
    },
    drawer: {
      width: drawerWidth,
      flexShrink: 0,
    },
    drawerPaper: {
      width: drawerWidth,
    },
    appBar: {
      paddingLeft: drawerWidth,
    },
    drawerOpen: {
      width: drawerWidth,
      transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
    },
    drawerClose: {
      transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      overflowX: "hidden",
      width: theme.spacing(7) + 1,
      [theme.breakpoints.up("sm")]: {
        width: theme.spacing(9) + 1,
      },
    },
    drawerContainer: {
      overflow: "auto",
    },
    toolbar: {
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-end",
      padding: theme.spacing(0, 1),
      // necessary for content to be below app bar
      ...theme.mixins.toolbar,
    },
    tabs: {
      width: "100%",
      [theme.breakpoints.down("md")]: {
        paddingTop: 60,
      },
    },
    tabPanel: {
      maxHeight: "100%",
      width: "100%",
      flexGrow: 1,
      flexShrink: 0,
      height: "100%",
      display: "none",
    },
    tabPanelSelected: {
      display: "flex",
    },
    content: {
      flexGrow: 1,
      height: "100%",
      width: "100%",
      display: "flex",
      flexDirection: "column",
    },
    eventFiltersBox: {
      display: "flex",
      flexDirection: "column",
    },
  })
);

interface EventsPanelProps {
  query: Omit<GetSearchEVentsQueryInput, "startDate" | "endDate"> & {
    hash: string;
    tab: number;
    page: number;
    startDate: string;
    endDate: string;
  };
}
export const EventsPanel: React.FC<EventsPanelProps> = ({
  query: {
    tab = 0,
    hash = "default",
    startDate,
    endDate,
    actors: actorIds = [],
    groups: groupIds = [],
    groupsMembers: groupsMembersIds = [],
    keywords: keywordIds = [],
    ...filtersRest
  },
}) => {
  const params = {
    ...filtersRest,
    startDate,
    endDate,
    actors: actorIds,
    groups: groupIds,
    groupsMembers: groupsMembersIds,
    keywords: keywordIds,
    hash: hash,
    tab,
  };

  const classes = useStyles();

  const navigateTo = useNavigate();

  const [open, setOpen] = React.useState(true);
  const [searchEvents, setSearchEvents] =
    React.useState<SearchEventQueryResult>({
      events: [],
      actors: [],
      groups: [],
      groupsMembers: [],
      keywords: [],
      totals: { uncategorized: 0, deaths: 0, patents: 0, scientificStudies: 0 },
    });

  const handleDrawerOpen = (): void => {
    setOpen(true);
  };

  const handleDrawerClose = (): void => {
    setOpen(false);
  };

  const [filters, updateState] = React.useState<{
    deaths: boolean;
    uncategorized: boolean;
    scientificStudies: boolean;
    patents: boolean;
  }>({
    deaths: false,
    uncategorized: false,
    scientificStudies: false,
    patents: false,
  });

  const handleUpdateCurrentView = React.useCallback(
    (update: Partial<Omit<CurrentView, "view">>): void => {
      navigateTo({ ...params, ...update, view: "events" });
      // const q = qs.stringify({ ...params, ...update });
      // history.push(`/events?${q}`);
      // void doUpdateCurrentView({
      //   ...view,
      //   ...params,
      //   ...update,
      // })();
    },
    [hash, tab, params]
  );

  const onActorsChange = React.useCallback(
    (actors: string[]): void => {
      handleUpdateCurrentView({
        actors,
      });
    },
    [params]
  );

  const onGroupsChange = React.useCallback(
    (groups: string[]): void => {
      handleUpdateCurrentView({
        groups,
      });
    },
    [params]
  );

  const onGroupMembersChange = React.useCallback(
    (groupsMembers: string[]): void => {
      handleUpdateCurrentView({
        groupsMembers,
      });
    },
    [params]
  );

  const onKeywordsChange = React.useCallback(
    (keywords: string[]): void => {
      handleUpdateCurrentView({
        _startIndex: 0,
        keywords,
      });
    },
    [params]
  );

  const onLoadMoreEvents = async (range: IndexRange): Promise<void> => {
    // eslint-disable-next-line @typescript-eslint/return-await
    return searchEventsQuery
      .run({
        ...params,
        _start: range.startIndex as any,
        _end: range.stopIndex as any,
      })()
      .then((result) => {
        if (result._tag === "Right") {
          setSearchEvents(result.right);
        }

        return new Promise((resolve) => {
          setTimeout(resolve, 100);
        });
      });
  };

  React.useEffect(() => {
    void onLoadMoreEvents({ startIndex: 0, stopIndex: 20 });
  }, [
    params.hash,
    params.startDate,
    params.endDate,
    params.actors,
    params.groups,
    params.keywords,
    params.groupsMembers,
  ]);

  return (
    <WithQueries
      queries={{
        filterActors: actorsDiscreteQuery,
        filterGroups: groupsDiscreteQuery,
        filterGroupsMembers: groupsMembersDiscreteQuery,
        filterKeywords: keywordsDiscreteQuery,
      }}
      params={{
        filterActors: {
          pagination: { page: 1, perPage: actorIds.length },
          sort: { field: "updatedAt", order: "DESC" },
          filter: { ids: actorIds },
        },
        filterGroups: {
          pagination: { page: 1, perPage: groupIds.length },
          sort: { field: "updatedAt", order: "DESC" },
          filter: { ids: groupIds },
        },
        filterGroupsMembers: {
          pagination: { page: 1, perPage: groupsMembersIds.length },
          sort: { field: "updatedAt", order: "DESC" },
          filter: { ids: groupsMembersIds },
        },
        filterKeywords: {
          pagination: { page: 1, perPage: keywordIds.length },
          sort: { field: "updatedAt", order: "DESC" },
          filter: { ids: keywordIds },
        },
      }}
      render={QR.fold(
        LazyFullSizeLoader,
        ErrorBox,
        ({
          filterActors,
          filterGroups,
          filterGroupsMembers,
          filterKeywords,
        }) => {
          const eventFilters = (
            <EventsFilter
              queryFilters={params}
              actors={filterActors.data}
              groups={filterGroups.data}
              groupsMembers={filterGroupsMembers.data}
              keywords={filterKeywords.data}
              onQueryFilterChange={handleUpdateCurrentView}
            />
          );
          return (
            <Box
              className={classes.root}
              style={{
                display: "flex",
                width: "100%",
                height: "100%",
              }}
            >
              <Hidden smDown>
                <Drawer
                  variant="permanent"
                  className={clsx(classes.drawer, {
                    [classes.drawerOpen]: open,
                    [classes.drawerClose]: !open,
                  })}
                  classes={{
                    paper: clsx(classes.drawerPaper, {
                      [classes.drawerOpen]: open,
                      [classes.drawerClose]: !open,
                    }),
                  }}
                >
                  <Toolbar />
                  <div className={classes.drawerContainer}>{eventFilters}</div>
                </Drawer>
              </Hidden>

              <Hidden mdUp>
                <EventsAppBar
                  summary={
                    <EventsFilterSummary
                      className={classes.appBar}
                      queryFilters={params}
                      actors={filterActors.data}
                      groups={filterGroups.data}
                      onQueryChange={handleUpdateCurrentView}
                      groupsMembers={filterGroupsMembers.data}
                      keywords={filterKeywords.data}
                      totals={searchEvents.totals}
                    />
                  }
                  expanded={eventFilters}
                />
              </Hidden>

              <main className={classes.content}>
                <Grid
                  item
                  sm={12}
                  md={12}
                  lg={10}
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    flexDirection: "column",
                    margin: "auto",
                    width: "100%",
                  }}
                >
                  <EventsTotals
                    totals={searchEvents.totals}
                    appBarClassName={classes.appBar}
                    filters={filters}
                    onFilterChange={(f) =>
                      updateState({
                        ...filters,
                        ...f,
                      })
                    }
                  />
                  <Tabs
                    className={classes.tabs}
                    value={tab}
                    onChange={(e, tab) => handleUpdateCurrentView({ tab })}
                  >
                    <Tab label="list" {...a11yProps(0)} />
                    <Tab label="map" {...a11yProps(1)} />
                    <Tab label="network" {...a11yProps(2)} />
                  </Tabs>
                </Grid>

                <TabPanel
                  className={clsx(classes.tabPanel, {
                    [classes.tabPanelSelected]: tab === 0,
                  })}
                  value={tab}
                  index={0}
                >
                  {tab === 0 ? (
                    <EventsTimeline
                      hash={hash}
                      queryParams={params}
                      data={searchEvents}
                      onLoadMoreEvents={onLoadMoreEvents}
                      filters={filters}
                      style={{ height: "100vh" }}
                      onClick={(e) => {
                        if (e.type === "Death") {
                          void doUpdateCurrentView({
                            view: "actor",
                            actorId: e.payload.victim.id,
                          })();
                        } else if (e.type === "Uncategorized") {
                          void doUpdateCurrentView({
                            view: "event",
                            eventId: e.id,
                          })();
                        }
                      }}
                      onGroupClick={(g) => {
                        onGroupsChange(
                          groupIds.includes(g.id)
                            ? groupIds.filter((aa) => g.id !== aa)
                            : groupIds.concat(g.id)
                        );
                      }}
                      onGroupMemberClick={(gm) => {
                        onGroupMembersChange(
                          groupsMembersIds.includes(gm.id)
                            ? groupsMembersIds.filter((aa) => gm.id !== aa)
                            : groupsMembersIds.concat(gm.id)
                        );
                      }}
                      onActorClick={(a) => {
                        onActorsChange(
                          actorIds.includes(a.id)
                            ? actorIds.filter((aa) => a.id !== aa)
                            : actorIds.concat(a.id)
                        );
                      }}
                      onKeywordClick={(k) => {
                        onKeywordsChange(
                          keywordIds.includes(k.id)
                            ? keywordIds.filter((aa) => k.id !== aa)
                            : keywordIds.concat(k.id)
                        );
                      }}
                    />
                  ) : null}
                </TabPanel>
                <TabPanel
                  className={clsx(classes.tabPanel, {
                    [classes.tabPanelSelected]: tab === 1,
                  })}
                  value={tab}
                  index={1}
                >
                  {tab === 1 ? (
                    <EventsMap
                      filter={{
                        actors: [],
                        groups: [],
                      }}
                      onMapClick={() => {}}
                    />
                  ) : null}
                </TabPanel>
                <TabPanel
                  className={clsx(classes.tabPanel, {
                    [classes.tabPanelSelected]: tab === 2,
                  })}
                  value={tab}
                  index={2}
                >
                  {tab === 2 ? (
                    <EventsNetwork
                      filter={params}
                      groupBy={"actor"}
                      scale={"all"}
                      scalePoint={O.none}
                      onEventClick={(e) => {
                        void doUpdateCurrentView({
                          view: "event",
                          eventId: e.id,
                        })();
                      }}
                    />
                  ) : null}
                  <div />
                </TabPanel>
              </main>
            </Box>
          );
        }
      )}
    />
  );
};
