import {
  EventType,
  type SearchEvent,
} from "@liexp/shared/lib/io/http/Events/index.js";
import {
  type Actor,
  type Group,
  type GroupMember,
  type Keyword,
} from "@liexp/shared/lib/io/http/index.js";
import * as React from "react";
import EventSliderModal from "../components/Modal/EventSliderModal.js";
import QueriesRenderer from "../components/QueriesRenderer.js";
import EventsTimeline from "../components/lists/EventList/EventsTimeline.js";
import { Box, Grid } from "../components/mui/index.js";
import { useEndpointQueries } from "../hooks/useEndpointQueriesProvider.js";
import { type SearchEventsQueryInputNoPagination } from "../state/queries/SearchEventsQuery.js";
import { styled } from "../theme/index.js";
import EventsAppBarBox from "./EventsAppBarBox.js";

const PREFIX = "EventsPanel";

const classes = {
  root: `${PREFIX}-root`,
  menuButton: `${PREFIX}-menuButton`,
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

const StyledBox = styled(Box)(({ theme }) => ({
  [`&.${classes.root}`]: {
    display: "flex",
    flexDirection: "row",
    height: "100%",
    [theme.breakpoints.down("md")]: {
      flexDirection: "column",
    },
  },

  [`& .${classes.menuButton}`]: {
    marginRight: 36,
  },

  [`& .${classes.drawer}`]: {
    width: drawerWidth,
    height: "100%",
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
    flexGrow: 1,
    height: "100%",
    width: "100%",
    display: "flex",
    flexDirection: "column",
  },

  [`& .${classes.eventFiltersBox}`]: {
    display: "flex",
    flexDirection: "column",
  },
}));

const drawerWidth = 240;

// interface EventsPanelProps {}

export interface EventsQueryParams {
  actors: string[];
  groups: string[];
  groupsMembers: string[];
  keywords: string[];
  locations: string[];
  media: string[];
  tab: number;
  startDate?: string;
  endDate?: string;
  title?: string;
  type?: EventType[];
  _sort: any;
  _order: any;
}

interface EventsPanelProps {
  query: SearchEventsQueryInputNoPagination;
  tab: number;
  keywords: Keyword.Keyword[];
  actors: Actor.Actor[];
  groups: Group.Group[];
  groupsMembers: GroupMember.GroupMember[];
  onQueryChange: (q: SearchEventsQueryInputNoPagination, tab: number) => void;
  onEventClick: (e: SearchEvent.SearchEvent) => void;
}

export const EventsPanel: React.FC<EventsPanelProps> = ({
  tab,
  query: { hash, slide: _slide, ..._query },
  actors,
  groups,
  groupsMembers,
  keywords,
  onQueryChange,
  onEventClick,
}) => {
  const slide = (_slide as any) === "true";
  const query = {
    type: EventType.types.map((t) => t.value),
    ..._query,
  };
  const handleUpdateEventsSearch = React.useCallback(
    (update: Partial<SearchEventsQueryInputNoPagination>): void => {
      onQueryChange({ ...query, ...update, hash }, tab);
    },
    [hash, tab, query, slide],
  );

  const handleEventClick = React.useCallback((e: SearchEvent.SearchEvent) => {
    onEventClick(e);
  }, []);

  const onActorsChange = React.useCallback(
    (a: Actor.Actor): void => {
      const aa = query.actors ?? [];
      const actors = aa.includes(a.id)
        ? aa.filter((aa) => a.id !== aa)
        : aa.concat(a.id);
      handleUpdateEventsSearch({
        actors,
      });
    },
    [query],
  );

  const onGroupsChange = React.useCallback(
    (g: Group.Group): void => {
      const gg = query.groups ?? [];

      const groups = gg.includes(g.id)
        ? gg.filter((aa) => g.id !== aa)
        : gg.concat(g.id);
      handleUpdateEventsSearch({
        groups,
      });
    },
    [query],
  );

  const onGroupMembersChange = React.useCallback(
    (groupsMembers: string[]): void => {
      handleUpdateEventsSearch({
        groupsMembers,
      });
    },
    [query],
  );

  const onKeywordsChange = React.useCallback(
    (k: Keyword.Keyword): void => {
      const kk = query.keywords ?? [];
      const keywords = kk.includes(k.id)
        ? kk.filter((aa) => k.id !== aa)
        : kk.concat(k.id);
      handleUpdateEventsSearch({
        keywords,
      });
    },
    [query],
  );

  return (
    <StyledBox
      id={`events-panel-${hash}`}
      className={classes.content}
      style={{
        height: "100%",
      }}
    >
      <EventsAppBarBox
        hash={hash}
        query={{ ...query, hash }}
        actors={actors.map((a) => ({ ...a, selected: true }))}
        groups={groups.map((g) => ({ ...g, selected: true }))}
        groupsMembers={groupsMembers}
        keywords={keywords.map((k) => ({ ...k, selected: true }))}
        onQueryChange={handleUpdateEventsSearch}
        onQueryClear={() => {
          onQueryChange({ hash }, 0);
        }}
        layout={{
          eventTypes: 4,
          dateRangeBox: { columns: 8, variant: "slider" },
          relations: 3,
        }}
      />
      <Grid
        container
        justifyContent="center"
        style={{
          height: "100%",
          flexDirection: "column",
          flexWrap: "nowrap",
        }}
      >
        {/* <Grid
          item
          md={12}
          justifyContent="center"
          style={{
            display: "flex",
            flexShrink: 0,
          }}
        ></Grid> */}

        <Grid
          item
          lg={12}
          xs={12}
          style={{ display: "flex", height: "100%", flexGrow: 1 }}
        >
          <EventsTimeline
            style={{ height: "100%" }}
            hash={hash}
            queryParams={query}
            onClick={handleEventClick}
            onGroupClick={onGroupsChange}
            onGroupMemberClick={(gm) => {
              const gmgg = query.groupsMembers ?? [];
              onGroupMembersChange(
                gmgg.includes(gm.id)
                  ? gmgg.filter((aa) => gm.id !== aa)
                  : gmgg.concat(gm.id),
              );
            }}
            onActorClick={onActorsChange}
            onKeywordClick={onKeywordsChange}
          />
        </Grid>
      </Grid>
      <EventSliderModal
        open={slide}
        query={{ ...query, hash }}
        onQueryChange={handleUpdateEventsSearch}
        onQueryClear={() => {
          onQueryChange({ hash, slide: false }, 0);
        }}
        onClick={onEventClick}
        onActorClick={onActorsChange}
        onGroupClick={onGroupsChange}
        onKeywordClick={onKeywordsChange}
        onGroupMemberClick={(g) => {
          onActorsChange(g.actor);
        }}
      />
    </StyledBox>
  );
};

interface EventsPanelBoxProps
  extends Omit<
    EventsPanelProps,
    "groups" | "actors" | "keywords" | "groupsMembers"
  > {}

export const EventsPanelBox: React.FC<EventsPanelBoxProps> = ({
  query,
  ...props
}) => {
  const Queries = useEndpointQueries();

  return (
    <QueriesRenderer
      queries={{
        groups: Queries.Group.list.useQuery(
          {
            pagination: { perPage: query.groups?.length ?? 0, page: 1 },
            sort: { field: "createdAt", order: "DESC" },
            filter: { ids: query.groups },
          },
          undefined,
          true,
          `events-groups-${query.hash}`,
        ),
        actors: Queries.Actor.list.useQuery(
          {
            pagination: { perPage: query.actors?.length ?? 0, page: 1 },
            sort: { field: "createdAt", order: "DESC" },
            filter: { ids: query.actors },
          },
          undefined,
          true,
          `events-actors-${query.hash}`,
        ),
        keywords: Queries.Keyword.list.useQuery(
          {
            pagination: { perPage: query.keywords?.length ?? 0, page: 1 },
            sort: { field: "createdAt", order: "DESC" },
            filter: { ids: query.keywords },
          },
          undefined,
          true,
          `events-keywords-${query.hash}`,
        ),
      }}
      render={({
        actors: { data: actors },
        groups: { data: groups },
        keywords: { data: keywords },
      }) => {
        return (
          <EventsPanel
            {...props}
            query={query}
            actors={actors}
            groups={groups}
            keywords={keywords}
            groupsMembers={[]}
          />
        );
      }}
    />
  );
};
