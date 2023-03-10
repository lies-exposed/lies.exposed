import { fp } from "@liexp/core/fp";
import { type SearchEvent } from "@liexp/shared/io/http/Events/SearchEvent";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import QueriesRenderer from "../components/QueriesRenderer";
import SEO from "../components/SEO";
import EventsAppBar from "../components/events/EventsAppBar";
import EventsTimeline from "../components/lists/EventList/EventsTimeline";
import { Box, Grid } from "../components/mui";
import { EventNetworkGraphBox } from "../containers/graphs/EventNetworkGraphBox";
import { useGroupMembersQuery } from "../state/queries/DiscreteQueries";
import { type SearchEventsQueryInputNoPagination } from "../state/queries/SearchEventsQuery";
import { useActorsQuery } from "../state/queries/actor.queries";
import { useGroupsQuery } from "../state/queries/groups.queries";
import { useKeywordsQuery } from "../state/queries/keywords.queries";
import { SplitPageTemplate } from "../templates/SplitPageTemplate";
import { styled } from "../theme";

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

export interface ExploreTemplateProps {
  hash: string;
  tab: number;
  params: SearchEventsQueryInputNoPagination;
  slide?: boolean;
  onQueryChange: (s: SearchEventsQueryInputNoPagination, t: number) => void;
  onQueryClear: () => void;
  onEventClick: (e: SearchEvent) => void;
}

const ExploreTemplate: React.FC<ExploreTemplateProps> = ({
  hash,
  params: p,
  tab,
  slide,
  onQueryChange,
  onQueryClear,
  onEventClick,
}) => {
  const params = {
    ...p,
  };

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
                    defaultExpanded={true}
                    query={{ ...params, slide, hash }}
                    actors={filterActors.data}
                    groups={filterGroups.data}
                    groupsMembers={filterGroupsMembers.data}
                    keywords={filterKeywords.data}
                    onQueryChange={(u) => {
                      onQueryChange(u, tab);
                    }}
                    onQueryClear={onQueryClear}
                    layout={{
                      eventTypes: 12,
                      dateRangeBox: 12,
                      relations: 12
                    }}
                  />
                }
                onTabChange={(tab) => {
                  onQueryChange(
                    {
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
                  queryParams={{ ...params, slide }}
                  onClick={onEventClick}
                  onActorClick={(actor) => {
                    onQueryChange(
                      {
                        ...params,
                        hash,
                        slide,
                        actors: (params.actors ?? []).concat([actor.id]),
                      },
                      tab
                    );
                  }}
                  onGroupClick={(group) => {
                    onQueryChange(
                      {
                        ...params,
                        hash,
                        slide,
                        groups: (params.groups ?? []).concat([group.id]),
                      },
                      tab
                    );
                  }}
                  onGroupMemberClick={() => {}}
                  onKeywordClick={(keyword) => {
                    onQueryChange(
                      {
                        ...params,
                        hash,
                        slide,
                        keywords: (params.keywords ?? []).concat([keyword.id]),
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
                      startDate: params.startDate,
                      endDate: params.endDate,
                    }}
                    type="events"
                    onEventClick={onEventClick}
                    onActorClick={(a) => {
                      onQueryChange(
                        {
                          ...params,
                          slide,
                          hash,
                          actors: [a.id],
                        },
                        tab
                      );
                    }}
                    onKeywordClick={(k) => {
                      onQueryChange(
                        {
                          ...params,
                          slide,
                          hash,
                          keywords: [k.id],
                        },
                        tab
                      );
                    }}
                    onGroupClick={(k) => {
                      onQueryChange(
                        {
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

export default ExploreTemplate;
