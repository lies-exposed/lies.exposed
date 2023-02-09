import { fp } from "@liexp/core/fp";
import { EventType } from "@liexp/shared/io/http/Events";
import { type GetSearchEventsQueryInput } from "@liexp/shared/io/http/Events/SearchEventsQuery";
import QueriesRenderer from "@liexp/ui/components/QueriesRenderer";
import SEO from "@liexp/ui/components/SEO";
import EventsAppBar from "@liexp/ui/components/events/EventsAppBar";
import EventsTimeline from "@liexp/ui/components/lists/EventList/EventsTimeline";
import { Box, Grid } from "@liexp/ui/components/mui";
import { EventNetworkGraphBox } from "@liexp/ui/containers/graphs/EventNetworkGraphBox";
import { useGroupMembersQuery } from "@liexp/ui/state/queries/DiscreteQueries";
import {
  clearSearchEventsQueryCache,
  type SearchEventQueryInput,
  type SearchEventsQueryInputNoPagination,
} from "@liexp/ui/state/queries/SearchEventsQuery";
import { useActorsQuery } from "@liexp/ui/state/queries/actor.queries";
import { useGroupsQuery } from "@liexp/ui/state/queries/groups.queries";
import { useKeywordsQuery } from "@liexp/ui/state/queries/keywords.queries";
import { SplitPageTemplate } from "@liexp/ui/templates/SplitPageTemplate";
import { styled } from "@liexp/ui/theme";
import {
  queryToHash,
  useQueryFromHash,
  useRouteQuery,
} from "@liexp/ui/utils/history.utils";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import { queryClient } from "../state/queries";
import {
  useNavigateToResource,
  type EventsView,
} from "../utils/location.utils";

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
  tab: number;
  slide?: string;
  hash: string;
} => {
  const query = useRouteQuery();

  const hashQuery = useQueryFromHash(query.hash);
  return React.useMemo(() => {
    return {
      ...query,
      ...hashQuery,
      tab: parseInt(query.tab ?? "0", 10),
    };
  }, [query]);
};

interface EventsPageProps extends Omit<EventsView, "view"> {}

const EventsPage: React.FC<EventsPageProps> = () => {
  const { hash, tab, ...query } = useEventsPageQuery();

  const navigateTo = useNavigateToResource();

  const params: Omit<SearchEventQueryInput, "_start" | "_end"> = {
    hash,
    startDate: query.startDate,
    endDate: query.endDate,
    actors: query.actors ?? [],
    groups: query.groups ?? [],
    groupsMembers: query.groupsMembers ?? [],
    keywords: query.keywords ?? [],
    media: query.media ?? [],
    locations: query.locations ?? [],
    type: (query.type as EventType[]) ?? EventType.types.map((t) => t.value),
    title: query.title,
    _order: query._order ?? "DESC",
    _sort: "date",
  };

  const slide = React.useMemo(
    () => parseInt(query.slide ?? "0", 10) === 1,
    [query]
  );

  const handleUpdateEventsSearch = React.useCallback(
    (
      { slide, ...update }: SearchEventsQueryInputNoPagination,
      tab: number
    ): void => {
      clearSearchEventsQueryCache();
      void queryClient.invalidateQueries("events-search-infinite").then(() => {
        navigateTo.events(
          {},
          {
            hash: queryToHash({ ...params, ...update }),
            tab,
            slide: slide ? 1 : 0,
          }
        );
      });
    },
    [hash, tab, params, slide]
  );

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
          filterActors: useActorsQuery(
            {
              pagination: { page: 1, perPage: params.actors?.length ?? 0 },
              filter: { ids: params.actors },
            },
            true
          ),
          filterGroups: useGroupsQuery(
            {
              pagination: { page: 1, perPage: params.groups?.length ?? 0 },
              filter: { ids: params.groups },
            },
            true
          ),
          filterGroupsMembers: useGroupMembersQuery(
            {
              pagination: {
                page: 1,
                perPage: params.groupsMembers?.length ?? 0,
              },
              filter: { ids: params.groupsMembers },
            },
            true
          ),
          filterKeywords: useKeywordsQuery(
            {
              pagination: { page: 1, perPage: params.keywords?.length ?? 0 },
              sort: { field: "updatedAt", order: "DESC" },
              filter: { ids: params.keywords },
            },
            true
          ),
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
              <SplitPageTemplate
                aside={
                  <EventsAppBar
                    hash={hash}
                    query={{ ...query, slide, hash }}
                    actors={filterActors.data}
                    groups={filterGroups.data}
                    groupsMembers={filterGroupsMembers.data}
                    keywords={filterKeywords.data}
                    onQueryChange={(u) => {
                      handleUpdateEventsSearch(u, tab);
                    }}
                    onQueryClear={() => {
                      navigateTo.events({}, {});
                    }}
                  />
                }
                onTabChange={(tab) => {
                  handleUpdateEventsSearch(
                    {
                      ...query,
                      ...params,
                      slide,
                      hash,
                    },
                    tab
                  );
                }}
                tab={tab}
                tabs={[
                  {
                    label: "Events",
                  },
                  {
                    label: "Network",
                  },
                ]}
                resource={{ name: "events", item: {} }}
              >
                <EventsTimeline
                  hash={hash}
                  queryParams={{ ...query, ...params, slide }}
                  onClick={(e) => {
                    navigateTo.events({ id: e.id });
                  }}
                  onActorClick={(actor) => {
                    handleUpdateEventsSearch(
                      {
                        ...query,
                        hash,
                        slide,
                        actors: (query.actors ?? []).concat([actor.id]),
                      },
                      tab
                    );
                  }}
                  onGroupClick={(group) => {
                    handleUpdateEventsSearch(
                      {
                        ...query,
                        hash,
                        slide,
                        groups: (query.groups ?? []).concat([group.id]),
                      },
                      tab
                    );
                  }}
                  onGroupMemberClick={() => {}}
                  onKeywordClick={(keyword) => {
                    handleUpdateEventsSearch(
                      {
                        ...query,
                        hash,
                        slide,
                        keywords: (query.keywords ?? []).concat([keyword.id]),
                      },
                      tab
                    );
                  }}
                />
                <Box style={{ height: 600 }}>
                  <EventNetworkGraphBox
                    query={{
                      keywords: pipe(
                        fp.NEA.fromArray(filterKeywords.data.map((d) => d.id)),
                        fp.O.toUndefined
                      ),
                      actors: pipe(
                        fp.NEA.fromArray(filterActors.data.map((a) => a.id)),
                        fp.O.toUndefined
                      ),
                      groups: pipe(
                        fp.NEA.fromArray(filterGroups.data.map((a) => a.id)),
                        fp.O.toUndefined
                      ),
                      startDate: query.startDate,
                      endDate: query.endDate,
                    }}
                    type="events"
                    onEventClick={(e) => {
                      navigateTo.events({ id: e.id });
                    }}
                    onActorClick={(a) => {
                      handleUpdateEventsSearch(
                        {
                          ...query,
                          ...params,
                          slide,
                          hash,
                          actors: [a.id],
                        },
                        tab
                      );
                    }}
                    onKeywordClick={(k) => {
                      handleUpdateEventsSearch(
                        {
                          ...query,
                          ...params,
                          slide,
                          hash,
                          keywords: [k.id],
                        },
                        tab
                      );
                    }}
                    onGroupClick={(k) => {
                      handleUpdateEventsSearch(
                        {
                          ...query,
                          ...params,
                          slide,
                          hash,
                          groups: params.groups
                            ? params.groups.concat(k.id)
                            : [k.id],
                        },
                        tab
                      );
                    }}
                  />
                </Box>
              </SplitPageTemplate>
            </Box>
          );
        }}
      />
    </StyledGrid>
  );
};

export default EventsPage;
