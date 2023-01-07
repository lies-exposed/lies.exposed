import { Actor, Group, GroupMember, Keyword } from "@liexp/shared/io/http";
import { EventType, SearchEvent } from "@liexp/shared/io/http/Events";
import * as React from "react";
import EventSliderModal from "../components/Modal/EventSliderModal";
import QueriesRenderer from "../components/QueriesRenderer";
import EventsAppBar from "../components/events/EventsAppBar";
import EventsTimeline from "../components/lists/EventList/EventsTimeline";
import { Box, Grid } from "../components/mui";
import {
  useActorsQuery,
  useGroupsQuery,
  useKeywordsQuery,
} from "../state/queries/DiscreteQueries";
import { SearchEventsQueryInputNoPagination } from "../state/queries/SearchEventsQuery";
import { styled } from "../theme";

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
  slide: boolean;
  keywords: Keyword.Keyword[];
  actors: Actor.Actor[];
  groups: Group.Group[];
  groupsMembers: GroupMember.GroupMember[];
  onQueryChange: (q: SearchEventsQueryInputNoPagination, tab: number) => void;
  onEventClick: (e: SearchEvent.SearchEvent) => void;
}

export const EventsPanel: React.FC<EventsPanelProps> = ({
  tab,
  slide,
  query: { hash, ...query },
  actors,
  groups,
  groupsMembers,
  keywords,
  onQueryChange,
  onEventClick,
}) => {
  const handleUpdateEventsSearch = React.useCallback(
    (update: Partial<SearchEventsQueryInputNoPagination>): void => {
      onQueryChange({ ...query, ...update, hash }, tab);
    },
    [hash, tab, query, slide]
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
    [query]
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
    (k: Keyword.Keyword): void => {
      const kk = query.keywords ?? [];
      const keywords = kk.includes(k.id)
        ? kk.filter((aa) => k.id !== aa)
        : kk.concat(k.id);
      handleUpdateEventsSearch({
        keywords,
      });
    },
    [query]
  );

  return (
    <StyledBox
      id={`events-panel-${hash}`}
      className={classes.content}
      style={{
        height: "100%",
      }}
    >
      <Grid
        container
        justifyContent="center"
        style={{
          height: "100%",
        }}
      >
        <Grid container justifyContent="center">
          <EventsAppBar
            hash={hash}
            query={{ ...query, hash }}
            tab={tab}
            actors={actors}
            groups={groups}
            groupsMembers={groupsMembers}
            keywords={keywords}
            onQueryChange={handleUpdateEventsSearch}
            onQueryClear={() => {
              onQueryChange({ hash }, 0);
            }}
          />
        </Grid>

        <Grid item lg={12} xs={12} style={{ height: "100%" }}>
          <EventsTimeline
            hash={hash}
            queryParams={query}
            onClick={handleEventClick}
            onGroupClick={onGroupsChange}
            onGroupMemberClick={(gm) => {
              const gmgg = query.groupsMembers ?? [];
              onGroupMembersChange(
                gmgg.includes(gm.id)
                  ? gmgg.filter((aa) => gm.id !== aa)
                  : gmgg.concat(gm.id)
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
          onQueryChange({ hash }, 0);
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
  return (
    <QueriesRenderer
      queries={{
        groups: useGroupsQuery(
          {
            pagination: { perPage: query.groups?.length ?? 0, page: 1 },
            sort: { field: "createdAt", order: "DESC" },
            filter: { ids: query.groups },
          },
          true
        ),
        actors: useActorsQuery(
          {
            pagination: { perPage: query.actors?.length ?? 0, page: 1 },
            sort: { field: "createdAt", order: "DESC" },
            filter: { ids: query.actors },
          },
          true
        ),
        keywords: useKeywordsQuery(
          {
            pagination: { perPage: query.keywords?.length ?? 0, page: 1 },
            sort: { field: "createdAt", order: "DESC" },
            filter: { ids: query.keywords },
          },
          true
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
