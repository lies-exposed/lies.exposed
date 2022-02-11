import { ErrorBox } from "@econnessione/ui/components/Common/ErrorBox";
import { LazyFullSizeLoader } from "@econnessione/ui/components/Common/FullSizeLoader";
import {
  a11yProps,
  TabPanel,
} from "@econnessione/ui/components/Common/TabPanel";
import EventsMap from "@econnessione/ui/components/EventsMap";
import {
  actorsDiscreteQuery,
  groupsDiscreteQuery,
  groupsMembersDiscreteQuery,
  keywordsDiscreteQuery,
} from "@econnessione/ui/state/queries/DiscreteQueries";
import { searchEventsQuery } from "@econnessione/ui/state/queries/SearchEventsQuery";
import { ECOTheme } from "@econnessione/ui/theme";
import {
  Box,
  createStyles,
  Drawer,
  Grid,
  makeStyles,
  Tab,
  Tabs,
  Toolbar,
  useTheme,
} from "@material-ui/core";
import * as QR from "avenger/lib/QueryResult";
import { WithQueries } from "avenger/lib/react";
import clsx from "clsx";
import * as O from "fp-ts/lib/Option";
import * as React from "react";
import EventsFilter from "../components/events/EventsFilter";
import { EventsTotals } from "../components/events/EventsTotals";
import {
  CurrentView,
  doUpdateCurrentView,
  EventsView,
} from "../utils/location.utils";
import { EventsNetwork } from "./EventsNetwork";
import InfiniteEventList from "./InfiniteEventList";

const drawerWidth = 240;

const useStyles = makeStyles((theme: ECOTheme) =>
  createStyles({
    root: {
      display: "flex",
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
    tabPanel: {
      maxHeight: "100%",
      flexGrow: 1
    },
    content: {
      flexGrow: 1,
      height: "100%",
    },
  })
);

interface EventsPanelProps {
  view: CurrentView;
  showFilters: boolean;
  filters: Required<Omit<EventsView, "view">>;
}
export const EventsPanel: React.FC<EventsPanelProps> = ({
  view,
  showFilters,
  filters: {
    tab = 0,
    hash,
    startDate,
    endDate,
    actors: actorIds,
    groups: groupIds,
    groupsMembers: groupsMembersIds,
    keywords: keywordIds,
    ...filtersRest
  },
}) => {
  const queryFilters = {
    ...filtersRest,
    startDate,
    endDate,
    actors: actorIds,
    groups: groupIds,
    groupsMembers: groupsMembersIds,
    keywords: keywordIds,
    hash,
    tab,
  };

  const classes = useStyles();
  const theme = useTheme();
  const [open, setOpen] = React.useState(true);

  const handleDrawerOpen = (): void => {
    setOpen(true);
  };

  const handleDrawerClose = (): void => {
    setOpen(false);
  };

  const [state, updateState] = React.useState<{
    currentPage: number;
    filters: {
      deaths: boolean;
      uncategorized: boolean;
      scientificStudies: boolean;
      patents: boolean;
    };
  }>({
    currentPage: 1,
    filters: {
      deaths: false,
      uncategorized: false,
      scientificStudies: false,
      patents: false,
    },
  });

  const handleBottomReached = React.useCallback((): void => {
    const nextPage = state.currentPage + 1;
    void updateState({
      ...state,
      currentPage: nextPage,
    });
  }, [state.currentPage]);

  React.useEffect(() => {
    if (state.currentPage > 1) {
      updateState((s) => ({
        ...s,
        currentPage: 1,
      }));
    }
  }, [hash]);

  const handleUpdateCurrentView = React.useCallback(
    (update: Partial<Omit<CurrentView, "view">>): void => {
      void doUpdateCurrentView({
        ...view,
        ...queryFilters,
        ...update,
      })();
    },
    [hash, tab, queryFilters]
  );

  const onActorsChange = React.useCallback(
    (actors: string[]): void => {
      handleUpdateCurrentView({
        actors,
      });
    },
    [queryFilters]
  );

  const onGroupsChange = React.useCallback(
    (groups: string[]): void => {
      handleUpdateCurrentView({
        groups,
      });
    },
    [queryFilters]
  );

  const onGroupMembersChange = React.useCallback(
    (groupsMembers: string[]): void => {
      handleUpdateCurrentView({
        groupsMembers,
      });
    },
    [queryFilters]
  );

  const onKeywordsChange = React.useCallback(
    (keywords: string[]): void => {
      handleUpdateCurrentView({
        keywords,
      });
    },
    [queryFilters]
  );

  return (
    <WithQueries
      queries={{
        filterActors: actorsDiscreteQuery,
        filterGroups: groupsDiscreteQuery,
        filterGroupsMembers: groupsMembersDiscreteQuery,
        filterKeywords: keywordsDiscreteQuery,
        searchEvents: searchEventsQuery,
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
        searchEvents: {
          ...queryFilters,
          links: [],
          page: state.currentPage,
          hash,
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
          searchEvents,
        }) => {
          return (
            <Box style={{ display: "flex", width: "100%", height: "100%" }}>
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
                <div className={classes.drawerContainer}>
                  <EventsFilter
                    queryFilters={queryFilters}
                    actors={filterActors.data}
                    groups={filterGroups.data}
                    groupsMembers={filterGroupsMembers.data}
                    keywords={filterKeywords.data}
                    onQueryFilterChange={handleUpdateCurrentView}
                  />
                </div>
              </Drawer>
              <main className={classes.content}>
                <Grid
                  item
                  sm={12}
                  md={12}
                  lg={12}
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                  }}
                >
                  <EventsTotals
                    totals={searchEvents.totals}
                    actors={filterActors.data}
                    groups={filterGroups.data}
                    keywords={filterGroups.data}
                    groupsMembers={filterGroupsMembers.data}
                    appBarClassName={classes.appBar}
                    queryFilters={queryFilters}
                    showFilters={showFilters}
                    filters={state.filters}
                    onFilterChange={(f) =>
                      updateState({
                        ...state,
                        filters: f,
                      })
                    }
                    onQueryChange={(f) => undefined}
                  />
                </Grid>
                <Tabs
                  style={{ width: "100%", marginBottom: 30 }}
                  value={tab}
                  onChange={(e, tab) => handleUpdateCurrentView({ tab })}
                >
                  <Tab label="list" {...a11yProps(0)} />
                  <Tab label="map" {...a11yProps(1)} />
                  <Tab label="network" {...a11yProps(2)} />
                </Tabs>

                <TabPanel className={classes.tabPanel} value={tab} index={0}>
                  {tab === 0 ? (
                    <InfiniteEventList
                      {...searchEvents}
                      hash={hash}
                      queryFilters={{
                        ...queryFilters,
                        page: state.currentPage,
                      }}
                      filters={state.filters}
                      onBottomReached={handleBottomReached}
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
                <TabPanel className={classes.tabPanel} value={tab} index={1}>
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
                <TabPanel className={classes.tabPanel} value={tab} index={2}>
                  {tab === 2 ? (
                    <EventsNetwork
                      filter={queryFilters}
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
