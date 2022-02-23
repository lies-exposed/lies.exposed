import { EventsPanel, EventsQueryParams } from "@containers/EventsPanel";
import { GetSearchEventsQueryInput } from "@econnessione/shared/io/http/Events/SearchEventsQuery";
import { formatDate } from "@econnessione/shared/utils/date";
import { ErrorBox } from "@econnessione/ui/components/Common/ErrorBox";
import { LazyFullSizeLoader } from "@econnessione/ui/components/Common/FullSizeLoader";
import SEO from "@econnessione/ui/components/SEO";
import {
  actorsDiscreteQuery,
  groupsDiscreteQuery,
  groupsMembersDiscreteQuery,
  keywordsDiscreteQuery,
} from "@econnessione/ui/state/queries/DiscreteQueries";
import { ECOTheme } from "@econnessione/ui/theme";
import {
  Box,
  createStyles,
  Drawer,
  Grid,
  Hidden,
  makeStyles,
  Toolbar,
} from "@material-ui/core";
import * as QR from "avenger/lib/QueryResult";
import { WithQueries } from "avenger/lib/react";
import clsx from "clsx";
import { subYears } from "date-fns";
import * as React from "react";
import EventsAppBar from "../components/events/EventsAppBar";
import EventsFilter from "../components/events/EventsFilter";
import EventsFilterSummary from "../components/events/EventsFiltersSummary";
import {
  queryToHash,
  useQueryFromHash,
  useRouteQuery,
} from "../utils/history.utils";
import { EventsView, useNavigateToResource } from "../utils/location.utils";

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
    tabs: {
      width: "100%",
      [theme.breakpoints.down("sm")]: {
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
      // flexGrow: 1,
      height: "100%",
      width: "100%",
      display: "flex",
      flexDirection: "column",
      [theme.breakpoints.down('sm')]: {
        paddingLeft: 0
      }
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
    tab,
  };

  const handleUpdateEventsSearch = React.useCallback(
    (update: EventsQueryParams): void => {
      navigateTo.events({}, { hash: queryToHash({ ...params, ...update }) });
    },
    [hash, tab, params]
  );

  return (
    <Grid container justifyContent="center" style={{ height: "100%" }}>
      <SEO
        title="lies.exposed - events timeline"
        description="A chronological timeline of events related to crimes and lies."
      />
      {/* <Grid item lg={12} md={12} sm={12}>
        <PageContent queries={{ pageContent: { path: "events" } }} />
      </Grid> */}

      <WithQueries
        queries={{
          filterActors: actorsDiscreteQuery,
          filterGroups: groupsDiscreteQuery,
          filterGroupsMembers: groupsMembersDiscreteQuery,
          filterKeywords: keywordsDiscreteQuery,
        }}
        params={{
          filterActors: {
            pagination: { page: 1, perPage: params.actors.length },
            sort: { field: "updatedAt", order: "DESC" },
            filter: { ids: params.actors },
          },
          filterGroups: {
            pagination: { page: 1, perPage: params.groups.length },
            sort: { field: "updatedAt", order: "DESC" },
            filter: { ids: params.groups },
          },
          filterGroupsMembers: {
            pagination: { page: 1, perPage: params.groupsMembers.length },
            sort: { field: "updatedAt", order: "DESC" },
            filter: { ids: params.groupsMembers },
          },
          filterKeywords: {
            pagination: { page: 1, perPage: params.keywords.length },
            sort: { field: "updatedAt", order: "DESC" },
            filter: { ids: params.keywords },
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
                onQueryFilterChange={handleUpdateEventsSearch as any}
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
                    <div className={classes.drawerContainer}>
                      {eventFilters}
                    </div>
                  </Drawer>
                </Hidden>

                <Grid
                  item
                  lg={12}
                  md={12}
                  sm={12}
                  style={{ maxWidth: "100%", height: "100%", width: "100%" }}
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
                          totals={{
                            uncategorized: 0,
                            scientificStudies: 0,
                            patents: 0,
                            deaths: 0,
                          }}
                        />
                      }
                      expanded={eventFilters}
                    />
                  </Hidden>
                  <main className={classes.content}>
                    <EventsPanel
                      hash={hash}
                      query={params}
                      onQueryChange={handleUpdateEventsSearch}
                    />
                  </main>
                </Grid>
              </Box>
            );
          }
        )}
      />
    </Grid>
  );
};

export default EventsPage;
