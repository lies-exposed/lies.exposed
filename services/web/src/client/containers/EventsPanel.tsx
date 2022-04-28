import { Actor, Group, GroupMember, Keyword } from "@liexp/shared/io/http";
import {
  Death,
  Documentary,
  EventType,
  Patent,
  ScientificStudy,
  SearchEvent,
  Transaction,
  Uncategorized,
} from "@liexp/shared/io/http/Events";
import { a11yProps, TabPanel } from "@liexp/ui/components/Common/TabPanel";
import EventsMap from "@liexp/ui/components/EventsMap";
import EventsTimeline from "@liexp/ui/src/components/lists/EventList/EventsTimeline";
import { ECOTheme } from "@liexp/ui/theme";
import {
  Box,
  createStyles,
  Grid,
  makeStyles,
  Tab,
  Tabs,
  useTheme,
} from "@material-ui/core";
import clsx from "clsx";
import * as O from "fp-ts/lib/Option";
import * as React from "react";
import AddEventModal from "../components/events/AddEventModal";
import EventsTotals from "../components/events/inputs/SearchEventInput";
import { useNavigateToResource } from "../utils/location.utils";
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
    tabPanel: {
      maxHeight: "100%",
      minHeight: 500,
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

export interface EventsQueryParams {
  actors: string[];
  groups: string[];
  groupsMembers: string[];
  keywords: string[];
  tab: number;
  startDate?: string;
  endDate?: string;
  title?: string;
  type?: EventType[];
  _sort: any;
  _order: any;
}

interface EventsPanelProps {
  hash: string;
  query: EventsQueryParams;
  keywords: Keyword.Keyword[];
  actors: Actor.Actor[];
  groups: Group.Group[];
  groupsMembers: GroupMember.GroupMember[];
  onQueryChange: (q: EventsQueryParams) => void;
  onQueryClear: () => void;
}

export const EventsPanel: React.FC<EventsPanelProps> = ({
  hash,
  query: { tab, ...query },
  keywords,
  actors,
  groups,
  groupsMembers,
  onQueryChange,
  onQueryClear,
}) => {
  const classes = useStyles();
  const theme = useTheme();

  const navigateTo = useNavigateToResource();

  const handleUpdateEventsSearch = React.useCallback(
    (update: Partial<EventsQueryParams>): void => {
      onQueryChange({ tab, ...query, ...update });
    },
    [hash, tab, query]
  );

  const handleEventClick = React.useCallback((e: SearchEvent.SearchEvent) => {
    navigateTo.events({ id: e.id });
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

  return (
    <Box id="events-panel" className={classes.content}>
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
          </TabPanel>
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

      <AddEventModal query={query} hash={hash} container={"events-panel"} />
    </Box>
  );
};
