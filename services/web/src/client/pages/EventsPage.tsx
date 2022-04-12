import { EventType } from "@liexp/shared/io/http/Events";
import { GetSearchEventsQueryInput } from "@liexp/shared/io/http/Events/SearchEventsQuery";
import { formatDate } from "@liexp/shared/utils/date";
import QueriesRenderer from "@liexp/ui/components/QueriesRenderer";
import SEO from "@liexp/ui/components/SEO";
import {
  useActorsDiscreteQuery,
  useGroupsDiscreteQuery,
  useGroupsMembersDiscreteQuery,
  useKeywordsDiscreteQuery
} from "@liexp/ui/state/queries/DiscreteQueries";
import { clearSearchEventsQueryCache } from "@liexp/ui/state/queries/SearchEventsQuery";
import { ECOTheme } from "@liexp/ui/theme";
import {
  Box,
  createStyles,
  Drawer,
  Grid,
  Hidden,
  makeStyles,
  Toolbar
} from "@material-ui/core";
import clsx from "clsx";
import { subYears } from "date-fns";
import * as React from "react";
import EventsAppBar from "../components/events/EventsAppBar";
import EventsFilter from "../components/events/EventsFilter";
import EventsFilterSummary from "../components/events/EventsFiltersSummary";
import { queryClient } from "../state/queries";
import {
  queryToHash,
  useQueryFromHash,
  useRouteQuery
} from "../utils/history.utils";
import { EventsView, useNavigateToResource } from "../utils/location.utils";
import { EventsPanel, EventsQueryParams } from "@containers/EventsPanel";

const MIN_DATE = formatDate(subYears(new Date(), 100));
const MAX_DATE = formatDate(new Date());

const drawerWidth = 240;

const useStyles = makeStyles((theme: ECOTheme) =>
  createStyles({
    root: {
      display: "flex",
      flexDirection: "row",
      [theme.breakpoints.down("sm")]: {
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
    content: {
      height: "100%",
      width: "100%",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      padding: theme.spacing(2),
      [theme.breakpoints.down("sm")]: {
        paddingLeft: 0,
        paddingRight: 0,
      },
    },
    eventFiltersBox: {
      display: "flex",
      flexDirection: "column",
    },
  })
);

interface EventsPageProps extends Omit<EventsView, "view"> {}

const EventsPage: React.FC<EventsPageProps> = () => {
  const { hash } = useRouteQuery() as { hash: string };
  const query = useQueryFromHash(hash) as GetSearchEventsQueryInput & {
    tab?: string;
  };
  const navigateTo = useNavigateToResource();
  const tab = parseInt(query.tab ?? "0", 10);
  const classes = useStyles();

  const params = {
    startDate: query.startDate ?? MIN_DATE,
    endDate: query.endDate ?? MAX_DATE,
    actors: query.actors ?? [],
    groups: query.groups ?? [],
    groupsMembers: query.groupsMembers ?? [],
    keywords: query.keywords ?? [],
    media: query.media ?? [],
    tab,
    type: (query.type as EventType[]) ?? EventType.types.map((t) => t.value),
    title: query.title,
    _order: query._order,
    _sort: 'date'
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

  return (
    <Grid container justifyContent="center" style={{ height: "100%" }}>
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
          const eventFilters = (
            <EventsFilter
              queryFilters={params}
              actors={filterActors.data}
              groups={filterGroups.data}
              groupsMembers={filterGroupsMembers.data}
              keywords={filterKeywords.data}
              media={[]}
              onQueryChange={handleUpdateEventsSearch as any}
              onQueryClear={() => {
                navigateTo.events({}, {});
              }}
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
                <Hidden mdUp>
                  <EventsAppBar
                    summary={
                      <EventsFilterSummary
                        className={classes.appBar}
                        queryFilters={{ ...params, tab, hash }}
                        actors={filterActors.data}
                        groups={filterGroups.data}
                        onQueryChange={handleUpdateEventsSearch}
                        groupsMembers={filterGroupsMembers.data}
                        keywords={filterKeywords.data}
                        media={[]}
                        totals={{
                          uncategorized: 0,
                          scientificStudies: 0,
                          patents: 0,
                          deaths: 0,
                          documentaries: 0,
                          transactions: 0,
                        }}
                      />
                    }
                    expanded={eventFilters}
                  />
                </Hidden>
                <main className={classes.content}>
                  <Grid
                    container
                    alignItems="center"
                    justifyContent="center"
                    style={{ height: "100%" }}
                  >
                    <Grid
                      item
                      lg={10}
                      md={12}
                      sm={12}
                      xs={12}
                      style={{ height: "100%" }}
                    >
                      <EventsPanel
                        hash={hash}
                        query={params}
                        actors={filterActors.data}
                        groups={filterGroups.data}
                        keywords={filterKeywords.data}
                        groupsMembers={filterGroupsMembers.data}
                        onQueryChange={handleUpdateEventsSearch}
                      />
                    </Grid>
                  </Grid>
                </main>
              </Grid>
            </Box>
          );
        }}
      />
    </Grid>
  );
};

export default EventsPage;
