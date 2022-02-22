import {
  a11yProps,
  TabPanel
} from "@econnessione/ui/components/Common/TabPanel";
import EventsMap from "@econnessione/ui/components/EventsMap";
import { SearchEvent } from "@econnessione/ui/components/lists/EventList/EventListItem";
import EventsTimeline from "@econnessione/ui/src/components/lists/EventList/EventsTimeline";
import {
  SearchEventQueryResult,
  searchEventsQuery
} from "@econnessione/ui/state/queries/SearchEventsQuery";
import { ECOTheme } from "@econnessione/ui/theme";
import {
  Box,
  createStyles, Grid, makeStyles,
  Tab,
  Tabs
} from "@material-ui/core";
import clsx from "clsx";
import * as O from "fp-ts/lib/Option";
import * as React from "react";
import { IndexRange } from "react-virtualized";
import EventsTotals from "../components/events/EventsTotals";
import {
  useNavigateToResource
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

// interface EventsPanelProps {}

const initialState: SearchEventQueryResult = {
  events: [],
  actors: [],
  groups: [],
  groupsMembers: [],
  keywords: [],
  totals: { uncategorized: 0, deaths: 0, patents: 0, scientificStudies: 0 },
};

export interface EventsQueryParams {
  actors: string[];
  groups: string[];
  groupsMembers: string[];
  keywords: string[];
  startDate: string;
  endDate: string;
  tab: number;
}

interface EventsPanelProps {
  hash: string;
  query: EventsQueryParams;
  onQueryChange: (q: EventsQueryParams) => void;
}

export const EventsPanel: React.FC<EventsPanelProps> = ({
  hash,
  query: { tab, ...query },
  onQueryChange,
}) => {
  const classes = useStyles();

  const navigateTo = useNavigateToResource();

  const [open, setOpen] = React.useState(true);
  const [searchEvents, setSearchEvents] = React.useState(initialState);

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

  const handleUpdateEventsSearch = React.useCallback(
    (update: Partial<EventsQueryParams>): void => {
      onQueryChange({ tab, ...query, ...update });
    },
    [hash, tab, query]
  );

  const handleEventClick = React.useCallback((e: SearchEvent) => {
    if (e.type === "Death") {
      navigateTo.actors({ id: e.payload.victim.id});
    } else if (e.type === "Uncategorized") {
      navigateTo.events({ id: e.id});
    }
  }, []);

  const onActorsChange = React.useCallback(
    (actors: string[]): void => {
      handleUpdateEventsSearch({
        actors,
      });
    },
    [query]
  );

  const onGroupsChange = React.useCallback(
    (groups: string[]): void => {
      handleUpdateEventsSearch({
        groups,
      });
    },
    [query]
  );

  const onGroupMembersChange = React.useCallback(
    (groupsMembers: string[]): void => {
      handleUpdateEventsSearch({
        groupsMembers,
      });
    },
    [query]
  );

  const onKeywordsChange = React.useCallback(
    (keywords: string[]): void => {
      handleUpdateEventsSearch({
        keywords,
      });
    },
    [query]
  );

  const onLoadMoreEvents = async (range: IndexRange): Promise<void> => {
    // eslint-disable-next-line @typescript-eslint/return-await
    return searchEventsQuery
      .run({
        ...query,
        hash,
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
  }, [hash]);

  return (
    <Box className={classes.content}>
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
          appBarClassName={classes.appBar}
          filters={filters}
          totals={searchEvents.totals}
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
          onChange={(e, tab) => handleUpdateEventsSearch({ tab })}
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
            queryParams={query}
            data={searchEvents}
            onLoadMoreEvents={onLoadMoreEvents}
            filters={filters}
            style={{ height: "100vh" }}
            onClick={handleEventClick}
            onGroupClick={(g) => {
              onGroupsChange(
                query.groups.includes(g.id)
                  ? query.groups.filter((aa) => g.id !== aa)
                  : query.groups.concat(g.id)
              );
            }}
            onGroupMemberClick={(gm) => {
              onGroupMembersChange(
                query.groupsMembers.includes(gm.id)
                  ? query.groupsMembers.filter((aa) => gm.id !== aa)
                  : query.groupsMembers.concat(gm.id)
              );
            }}
            onActorClick={(a) => {
              onActorsChange(
                query.actors.includes(a.id)
                  ? query.actors.filter((aa) => a.id !== aa)
                  : query.actors.concat(a.id)
              );
            }}
            onKeywordClick={(k) => {
              onKeywordsChange(
                query.keywords.includes(k.id)
                  ? query.keywords.filter((aa) => k.id !== aa)
                  : query.keywords.concat(k.id)
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
            filter={query}
            groupBy={"actor"}
            scale={"all"}
            scalePoint={O.none}
            onEventClick={(e) => {
              navigateTo.events({
                id: e.id,
              });
            }}
          />
        ) : null}
        <div />
      </TabPanel>
    </Box>
  );
};
