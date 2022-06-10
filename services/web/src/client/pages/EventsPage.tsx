import { EventType } from "@liexp/shared/io/http/Events";
import { GetSearchEventsQueryInput } from "@liexp/shared/io/http/Events/SearchEventsQuery";
import QueriesRenderer from "@liexp/ui/components/QueriesRenderer";
import SEO from "@liexp/ui/components/SEO";
import { Box, Grid } from "@liexp/ui/components/mui";
import {
  useActorsDiscreteQuery,
  useGroupsDiscreteQuery,
  useGroupsMembersDiscreteQuery,
  useKeywordsDiscreteQuery
} from "@liexp/ui/state/queries/DiscreteQueries";
import { clearSearchEventsQueryCache } from "@liexp/ui/state/queries/SearchEventsQuery";
import { styled } from "@liexp/ui/theme";
import * as React from "react";
import EventsAppBar from "../components/events/EventsAppBar";
import { queryClient } from "../state/queries";
import {
  queryToHash,
  useQueryFromHash,
  useRouteQuery
} from "../utils/history.utils";
import {
  EventsView,
  useNavigateToResource
} from "../utils/location.utils";
import { EventsPanel, EventsQueryParams } from "@containers/EventsPanel";

const PREFIX = "EventsPage";

const classes = {
  root: `${PREFIX}-root`,
  menuButton: `${PREFIX}-menuButton`,
  hide: `${PREFIX}-hide`,
  drawer: `${PREFIX}-drawer`,
  drawerPaper: `${PREFIX}-drawerPaper`,
  appBar: `${PREFIX}-appBar`,
  drawerOpen: `${PREFIX}-drawerOpen`,
  drawerClose: `${PREFIX}-drawerClose`,
  drawerContainer: `${PREFIX}-drawerContainer`,
  toolbar: `${PREFIX}-toolbar`,
  content: `${PREFIX}-content`,
  eventFiltersBox: `${PREFIX}-eventFiltersBox`,
};

const StyledGrid = styled(Grid)(({ theme }) => ({
  [`& .${classes.root}`]: {
    display: "flex",
    flexDirection: "row",
    [theme.breakpoints.down("md")]: {
      flexDirection: "column",
    },
  },

  [`& .${classes.menuButton}`]: {
    marginRight: 36,
  },

  [`& .${classes.hide}`]: {
    display: "none",
  },

  [`& .${classes.drawer}`]: {
    width: drawerWidth,
    flexShrink: 0,
  },

  [`& .${classes.drawerPaper}`]: {
    width: drawerWidth,
  },

  [`& .${classes.appBar}`]: {
    paddingLeft: drawerWidth,
  },

  [`& .${classes.drawerOpen}`]: {
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },

  [`& .${classes.drawerClose}`]: {
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

  [`& .${classes.drawerContainer}`]: {
    overflow: "auto",
  },

  [`& .${classes.toolbar}`]: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
  },

  [`& .${classes.content}`]: {
    height: "100%",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    padding: 0,
    [theme.breakpoints.down("md")]: {
      paddingLeft: 0,
      paddingRight: 0,
    },
  },

  [`& .${classes.eventFiltersBox}`]: {
    display: "flex",
    flexDirection: "column",
  },
}));

// const MIN_DATE = formatDate(subYears(new Date(), 100));
// const MAX_DATE = formatDate(new Date());

const drawerWidth = 240;

const useEventsPageQuery = (): GetSearchEventsQueryInput & {
  tab?: string;
  hash: string;
} => {
  const query = useRouteQuery();

  const hashQuery = useQueryFromHash(query.hash);
  return React.useMemo(() => {
    return {
      ...query,
      ...hashQuery,
    };
  }, [query]);
};

interface EventsPageProps extends Omit<EventsView, "view"> {}

const EventsPage: React.FC<EventsPageProps> = () => {
  const { hash, ...query } = useEventsPageQuery();

  const navigateTo = useNavigateToResource();
  const tab = parseInt(query.tab ?? "0", 10);

  const params = {
    startDate: query.startDate,
    endDate: query.endDate,
    actors: query.actors ?? [],
    groups: query.groups ?? [],
    groupsMembers: query.groupsMembers ?? [],
    keywords: query.keywords ?? [],
    media: query.media ?? [],
    tab,
    type: (query.type as EventType[]) ?? EventType.types.map((t) => t.value),
    title: query.title,
    _order: query._order,
    _sort: "date",
  };

  const handleUpdateEventsSearch = React.useCallback(
    (update: EventsQueryParams): void => {
      clearSearchEventsQueryCache();
      void queryClient.invalidateQueries("events-search-infinite").then(() => {
        navigateTo.events({}, { hash: queryToHash({ ...params, ...update }) });
      });
    },
    [hash, tab, params]
  );

  // const hasFilters =
  //   params.actors.length > 0 ||
  //   params.groups.length > 0 ||
  //   params.keywords.length > 0 ||
  //   params.media.length > 0;

  return (
    <StyledGrid container justifyContent="center" style={{ height: "100%" }}>
      <SEO
        title="lies.exposed - events timeline"
        description="A chronological timeline of events related to crimes and lies."
        urlPath="events"
      />
      {/* <Grid item lg={12} md={12} sm={12}>
        <PageContent queries={{ pageContent: { path: "events" } }} />
      </Grid> */}

      <QueriesRenderer
        queries={{
          filterActors: useActorsDiscreteQuery({
            pagination: { page: 1, perPage: params.actors.length },
            sort: { field: "updatedAt", order: "DESC" },
            filter: params.actors.length > 0 ? { ids: params.actors } : {},
          }),
          filterGroups: useGroupsDiscreteQuery({
            pagination: { page: 1, perPage: params.groups.length },
            sort: { field: "updatedAt", order: "DESC" },
            filter: params.groups.length > 0 ? { ids: params.groups } : {},
          }),
          filterGroupsMembers: useGroupsMembersDiscreteQuery({
            pagination: { page: 1, perPage: params.groupsMembers.length },
            sort: { field: "updatedAt", order: "DESC" },
            filter:
              params.groupsMembers.length > 0
                ? { ids: params.groupsMembers }
                : {},
          }),
          filterKeywords: useKeywordsDiscreteQuery({
            pagination: { page: 1, perPage: params.keywords.length },
            sort: { field: "updatedAt", order: "DESC" },
            filter: params.keywords.length > 0 ? { ids: params.keywords } : {},
          }),
        }}
        render={({
          filterActors,
          filterGroups,
          filterGroupsMembers,
          filterKeywords,
        }) => {
          return (
            <Box
              className={classes.root}
              style={{
                display: "flex",
                width: "100%",
                height: "100%",
              }}
            >
              {/* <Hidden smDown>
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
              </Hidden> */}

              <Grid
                item
                lg={12}
                md={12}
                sm={12}
                style={{
                  maxWidth: `calc(100% - ${drawerWidth})`,
                  height: "100%",
                  width: "100%",
                }}
              >
                <Grid container justifyContent="center">
                  <EventsAppBar
                    hash={hash}
                    query={{ ...params, tab }}
                    actors={filterActors.data}
                    groups={filterGroups.data}
                    groupsMembers={filterGroupsMembers.data}
                    keywords={filterKeywords.data}
                    onQueryChange={handleUpdateEventsSearch}
                    onQueryClear={() => {
                      navigateTo.events({}, {});
                    }}
                  />
                </Grid>
                <main className={classes.content}>
                  <EventsPanel
                    hash={hash}
                    query={params}
                    actors={filterActors.data}
                    groups={filterGroups.data}
                    keywords={filterKeywords.data}
                    groupsMembers={filterGroupsMembers.data}
                    onQueryChange={handleUpdateEventsSearch}
                    onQueryClear={() => {
                      navigateTo.events({}, {});
                    }}
                  />
                </main>
              </Grid>
            </Box>
          );
        }}
      />
    </StyledGrid>
  );
};

export default EventsPage;
