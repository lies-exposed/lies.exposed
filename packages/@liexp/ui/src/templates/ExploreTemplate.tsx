import { fp } from "@liexp/core/lib/fp/index.js";
import { ACTORS } from "@liexp/shared/lib/io/http/Actor.js";
import { type UUID } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { type SearchEvent } from "@liexp/shared/lib/io/http/Events/SearchEvents/SearchEvent.js";
import { EventType } from "@liexp/shared/lib/io/http/Events/index.js";
import { GROUPS } from "@liexp/shared/lib/io/http/Group.js";
import { KEYWORDS } from "@liexp/shared/lib/io/http/Keyword.js";
import {
  isNonEmpty,
  type NonEmptyArray,
} from "@liexp/shared/lib/utils/array.utils.js";
import { formatDate } from "@liexp/shared/lib/utils/date.utils.js";
import { pipe } from "fp-ts/lib/function.js";
import * as React from "react";
import EventSliderModal from "../components/Modal/EventSliderModal.js";
import QueriesRenderer from "../components/QueriesRenderer.js";
import SEO from "../components/SEO.js";
import EventsTimeline from "../components/lists/EventList/EventsTimeline.js";
import {
  Box,
  FormControlLabel,
  FormGroup,
  Grid,
  Stack,
  Switch,
} from "../components/mui/index.js";
import EventsAppBarBox from "../containers/EventsAppBarBox.js";
import { EventsNetworkGraphBox } from "../containers/graphs/EventsNetworkGraphBox/EventsNetworkGraphBox.js";
import { useEndpointQueries } from "../hooks/useEndpointQueriesProvider.js";
import { type SearchEventsQueryInputNoPagination } from "../state/queries/SearchEventsQuery.js";
import { SplitPageTemplate } from "../templates/SplitPageTemplate.js";
import { styled } from "../theme/index.js";

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
  params,
  tab,
  slide,
  onQueryChange,
  onQueryClear,
  onEventClick,
}) => {
  const [relations, setRelations] = React.useState([
    KEYWORDS.literals[0],
    GROUPS.literals[0],
    ACTORS.literals[0],
  ]);

  const [condensedList, setCondensedList] = React.useState(false);

  const Queries = useEndpointQueries();

  return (
    <StyledGrid container justifyContent="center" style={{ height: "100%" }}>
      <SEO
        title="lies.exposed - events timeline"
        description="A chronological timeline of events related to crimes and lies."
        urlPath="events"
      />
      <QueriesRenderer
        queries={{
          filterActors: Queries.Actor.list.useQuery(
            {
              pagination: { page: 1, perPage: params.actors?.length ?? 0 },
              filter: { ids: params.actors ?? [] },
            },
            undefined,
            true,
          ),
          filterGroups: Queries.Group.list.useQuery(
            {
              pagination: { page: 1, perPage: params.groups?.length ?? 0 },
              filter: { ids: params.groups ?? [] },
            },
            undefined,
            true,
          ),
          filterGroupsMembers: Queries.GroupMember.list.useQuery(
            {
              pagination: {
                page: 1,
                perPage: params.groupsMembers?.length ?? 0,
              },
              filter: { ids: params.groupsMembers ?? [] },
            },
            undefined,
            true,
          ),
          filterKeywords: Queries.Keyword.list.useQuery(
            {
              pagination: { page: 1, perPage: params.keywords?.length ?? 0 },
              sort: { field: "updatedAt", order: "DESC" },
              filter: { ids: params.keywords ?? [] },
            },
            undefined,
            true,
          ),
        }}
        render={({
          filterActors,
          filterGroups,
          filterGroupsMembers,
          filterKeywords,
        }) => {
          const selectedKeywordIds = pipe(
            filterKeywords.data.map((d) => d.id),
            fp.O.fromPredicate(isNonEmpty),
            fp.O.toUndefined,
          ) as NonEmptyArray<UUID> | undefined;
          const selectedActorIds = pipe(
            [...filterActors.data.map((a) => a.id)],
            fp.O.fromPredicate(isNonEmpty),
            fp.O.toUndefined,
          ) as NonEmptyArray<UUID> | undefined;
          const selectedGroupIds = pipe(
            [...filterGroups.data.map((a) => a.id)],
            fp.O.fromPredicate(isNonEmpty),
            fp.O.toUndefined,
          ) as NonEmptyArray<UUID> | undefined;

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
                  <Stack padding={2} spacing={2}>
                    <EventsAppBarBox
                      hash={hash}
                      defaultExpanded={true}
                      query={{ ...params, slide, hash }}
                      actors={filterActors.data.map((i) => ({
                        ...i,
                        selected: true,
                      }))}
                      groups={filterGroups.data.map((i) => ({
                        ...i,
                        selected: true,
                      }))}
                      groupsMembers={filterGroupsMembers.data.map((i) => ({
                        ...i,
                        selected: true,
                      }))}
                      keywords={filterKeywords.data.map((i) => ({
                        ...i,
                        selected: true,
                      }))}
                      onQueryChange={(u) => {
                        onQueryChange(u, tab);
                      }}
                      onQueryClear={onQueryClear}
                      layout={{
                        searchBox: 10,
                        eventTypes: 12,
                        dateRangeBox: { columns: 12, variant: "picker" },
                        relations: 12,
                      }}
                    />
                  </Stack>
                }
                asideBottom={
                  <Stack
                    padding={2}
                    flexGrow={1}
                    alignItems={"flex-end"}
                    alignContent={"end"}
                  >
                    <FormGroup>
                      <FormControlLabel
                        control={
                          <Switch
                            size="small"
                            value={condensedList}
                            onChange={(e) => {
                              setCondensedList(e.target.checked);
                            }}
                          />
                        }
                        label="Condensed list"
                        labelPlacement="start"
                      />
                    </FormGroup>
                    <EventSliderModal
                      open={slide}
                      query={{ ...params, slide, hash }}
                      onQueryChange={(q) => {
                        onQueryChange(q, tab);
                      }}
                      onQueryClear={() => {
                        onQueryChange({ hash, slide: false }, 0);
                      }}
                      onClick={onEventClick}
                      onActorClick={() => {}}
                      onGroupClick={() => {}}
                      onKeywordClick={() => {}}
                      onGroupMemberClick={() => {}}
                    />
                  </Stack>
                }
                onTabChange={(tab) => {
                  onQueryChange(
                    {
                      ...params,
                      slide,
                      hash,
                    },
                    tab,
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
                  condensed={condensedList}
                  onActorClick={(actor) => {
                    onQueryChange(
                      {
                        ...params,
                        hash,
                        slide,
                        actors: (params.actors ?? []).concat([actor.id]),
                      },
                      tab,
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
                      tab,
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
                      tab,
                    );
                  }}
                />
                <Box style={{ maxHeight: "100%", height: "100%" }}>
                  <EventsNetworkGraphBox
                    relations={relations}
                    onRelationsChange={setRelations}
                    query={{
                      ids: undefined,
                      keywords: selectedKeywordIds,
                      actors: selectedActorIds,
                      groups: selectedGroupIds,
                      eventType: pipe(
                        params.eventType,
                        fp.O.fromPredicate(
                          (arr): arr is NonEmptyArray<EventType> =>
                            !!arr && isNonEmpty(arr),
                        ),
                        fp.O.getOrElse(
                          () =>
                            EventType.members.map(
                              (t) => t.literals[0],
                            ) as unknown as NonEmptyArray<EventType>,
                        ),
                      ),
                      startDate: params.startDate,
                      endDate: params.endDate ?? formatDate(new Date()),
                    }}
                    selectedKeywordIds={selectedKeywordIds}
                    selectedActorIds={selectedActorIds}
                    selectedGroupIds={selectedGroupIds}
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
                        tab,
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
                        tab,
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
                        tab,
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
