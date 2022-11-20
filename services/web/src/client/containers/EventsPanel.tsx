import { Actor, Group, GroupMember, Keyword } from "@liexp/shared/io/http";
import { EventType, SearchEvent } from "@liexp/shared/io/http/Events";
import { TabPanel } from "@liexp/ui/components/Common/TabPanel";
import EventSliderModal from "@liexp/ui/components/Modal/EventSliderModal";
import EventsTimeline from "@liexp/ui/components/lists/EventList/EventsTimeline";
import { Box, Grid } from "@liexp/ui/components/mui";
import useWindowsDimensions from "@liexp/ui/hooks/useWindowsDimensions";
import { SearchEventsQueryInputNoPagination } from "@liexp/ui/state/queries/SearchEventsQuery";
import { styled } from "@liexp/ui/theme";
import { clsx } from "clsx";
import * as React from "react";
import AddEventModal from "../components/events/AddEventModal";
import { useNavigateToResource } from "../utils/location.utils";

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
  tabPanel: `${PREFIX}-tabPanel`,
  tabPanelSelected: `${PREFIX}-tabPanelSelected`,
  content: `${PREFIX}-content`,
  eventFiltersBox: `${PREFIX}-eventFiltersBox`,
};

const StyledBox = styled(Box)(({ theme }) => ({
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

  [`& .${classes.tabPanel}`]: {
    maxHeight: "100%",
    minHeight: 500,
    width: "100%",
    flexGrow: 1,
    flexShrink: 0,
    height: "100%",
    display: "none",
  },

  [`& .${classes.tabPanelSelected}`]: {
    display: "flex",
  },

  [`&.${classes.content}`]: {
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
}

export const EventsPanel: React.FC<EventsPanelProps> = ({
  tab,
  slide,
  query: { hash, ...query },
  onQueryChange,
}) => {
  const navigateTo = useNavigateToResource();

  const { height } = useWindowsDimensions();

  const handleUpdateEventsSearch = React.useCallback(
    (update: Partial<SearchEventsQueryInputNoPagination>): void => {
      onQueryChange({ ...query, ...update, hash }, tab);
    },
    [hash, tab, query, slide]
  );

  const handleEventClick = React.useCallback((e: SearchEvent.SearchEvent) => {
    navigateTo.events({ id: e.id });
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
      id="events-panel"
      className={classes.content}
      style={{
        height,
      }}
    >
      <Grid
        container
        justifyContent="center"
        style={{
          height: "100%",
        }}
      >
        <Grid item lg={12} xs={12} style={{ height: "100%" }}>
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
                onClick={handleEventClick}
                onGroupClick={(g) => {
                  onGroupsChange(g);
                }}
                onGroupMemberClick={(gm) => {
                  const gmgg = query.groupsMembers ?? [];
                  onGroupMembersChange(
                    gmgg.includes(gm.id)
                      ? gmgg.filter((aa) => gm.id !== aa)
                      : gmgg.concat(gm.id)
                  );
                }}
                onActorClick={(a) => {
                  onActorsChange(a);
                }}
                onKeywordClick={(k) => {
                  onKeywordsChange(k);
                }}
              />
            ) : null}
          </TabPanel>
          {/* <TabPanel
            className={clsx(classes.tabPanel, {
              [classes.tabPanelSelected]: tab === 1,
            })}
            value={tab}
            index={1}
          >
            {tab === 1 ? (
              <Grid
                item
                lg={10}
                style={{
                  margin: "auto",
                }}
              >
                <EventsNetwork
                  includeEmptyRelations={false}
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
              </Grid>
            ) : null}
            <div />
          </TabPanel> */}
        </Grid>
      </Grid>

      {/* <TabPanel
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
      </TabPanel> */}
      <EventSliderModal
        open={slide}
        query={{ ...query, hash }}
        onQueryChange={handleUpdateEventsSearch}
        onQueryClear={() => {}}
        onClick={(e) => {
          navigateTo.events({ id: e.id });
        }}
        onActorClick={(a) => {
          onActorsChange(a);
        }}
        onGroupClick={(g) => {
          onGroupsChange(g);
        }}
        onKeywordClick={(k) => {
          onKeywordsChange(k);
        }}
        onGroupMemberClick={(g) => {
          navigateTo.actors({ id: g.actor.id });
        }}
      />
      <AddEventModal query={query} hash={hash} container={"events-panel"} />
    </StyledBox>
  );
};
