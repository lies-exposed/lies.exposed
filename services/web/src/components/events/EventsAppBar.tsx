import {
  Actor,
  Group,
  GroupMember,
  Keyword
} from "@econnessione/shared/io/http";
import { ActorList } from "@econnessione/ui/components/lists/ActorList";
import GroupList from "@econnessione/ui/components/lists/GroupList";
import { GroupsMembersList } from "@econnessione/ui/components/lists/GroupMemberList";
import KeywordList from "@econnessione/ui/components/lists/KeywordList";
import {
  AppBar, Grid,
  makeStyles,
  Typography,
  useTheme
} from "@material-ui/core";
import Box from "@material-ui/core/Box";
import Slide from "@material-ui/core/Slide";
import Toolbar from "@material-ui/core/Toolbar";
import * as React from "react";
import { EventsView } from "../../utils/location.utils";
import { EventsTotals, EventsTotalsProps } from "./EventsTotals";

const useStylesInHideScroll = makeStyles((theme) => ({
  filterBox: {
    display: "flex",
    alignItems: "center",
  },
  filterLabel: {
    marginBottom: 0,
    marginRight: theme.spacing(1),
  },
  filterValue: {
    marginRight: theme.spacing(1),
  },
  offset: {
    height: 200,
    minHeight: 200,
  },
}));

export interface EventsAppBarMinimalProps extends EventsTotalsProps {
  queryFilters: Required<Omit<EventsView, "view">>;
  showFilters: boolean;
  actors: Actor.Actor[];
  groups: Group.Group[];
  groupsMembers: GroupMember.GroupMember[];
  keywords: Keyword.Keyword[];
}

const EventsAppBarMinimal: React.FC<EventsAppBarMinimalProps> = (props) => {
  const {
    children,
    actors,
    groups,
    keywords,
    groupsMembers,
    queryFilters: { startDate, endDate },
    onFilterChange,
    filters,
    showFilters,
    totals,
  } = props;
  const theme = useTheme();
  const classes = useStylesInHideScroll();
  const [y, setY] = React.useState(window.scrollY);

  const handleNavigation = React.useCallback(
    (e) => {
      const window = e.currentTarget;
      if (y > window.scrollY) {
        // console.log("scrolling up");
      } else if (y < window.scrollY) {
        // console.log("scrolling down");
      }
      setY(window.scrollY);
    },
    [y]
  );

  React.useEffect(() => {
    setY(window.scrollY);
    window.addEventListener("scroll", handleNavigation);

    return () => {
      window.removeEventListener("scroll", handleNavigation);
    };
  }, [handleNavigation]);

  const totalEvents =
    totals.uncategorized + totals.deaths + totals.scientificStudies;

  return (
    <Box width="100%">
      <Slide mountOnEnter={true} appear={true} in={y > 100} direction="down">
        <AppBar
          position="fixed"
          elevation={0}
          color="transparent"
          style={{ background: theme.palette.common.white }}
        >
          <Toolbar disableGutters={true}>
            <Grid
              container
              style={{
                padding: 20,
                minHeight: 60,
                alignItems: "center",
                justifyItems: "center",
              }}
            >
              <Grid
                item
                md={8}
                lg={8}
                sm={12}
                style={{
                  display: "flex",
                  flexDirection: "row",
                }}
              >
                <Box className={classes.filterBox}>
                  <Typography variant="caption" className={classes.filterLabel}>
                    from
                  </Typography>
                  {startDate ? (
                    <Typography
                      display="inline"
                      variant="subtitle1"
                      color="primary"
                      className={classes.filterValue}
                    >
                      {startDate}
                    </Typography>
                  ) : null}
                  <Typography variant="caption" className={classes.filterLabel}>
                    until
                  </Typography>
                  {endDate ? (
                    <Typography
                      display="inline"
                      variant="subtitle1"
                      color="primary"
                      className={classes.filterValue}
                    >
                      {endDate}
                    </Typography>
                  ) : null}
                </Box>
                {keywords.length > 0 ? (
                  <Box className={classes.filterBox}>
                    <Typography
                      variant="subtitle1"
                      display="inline"
                      className={classes.filterLabel}
                      gutterBottom={false}
                    >
                      Keywords:
                    </Typography>
                    <KeywordList
                      style={{ display: "flex", flexDirection: "row" }}
                      keywords={keywords.map((a) => ({ ...a, selected: true }))}
                      onItemClick={() => {}}
                    />
                  </Box>
                ) : null}
                {actors.length > 0 ? (
                  <Box className={classes.filterBox}>
                    <Typography
                      variant="subtitle1"
                      display="inline"
                      className={classes.filterLabel}
                      gutterBottom={false}
                    >
                      Actors:
                    </Typography>
                    <ActorList
                      actors={actors.map((a) => ({ ...a, selected: true }))}
                      onActorClick={() => {}}
                    />
                  </Box>
                ) : null}
                {groups.length > 0 ? (
                  <Box className={classes.filterBox}>
                    <Typography
                      variant="subtitle1"
                      display="inline"
                      className={classes.filterLabel}
                      gutterBottom={false}
                    >
                      Groups:
                    </Typography>
                    <GroupList
                      groups={groups.map((g) => ({ ...g, selected: true }))}
                      onItemClick={() => {}}
                    />
                  </Box>
                ) : null}
                {groupsMembers.length > 0 ? (
                  <Box className={classes.filterBox}>
                    <Typography
                      variant="subtitle1"
                      display="inline"
                      className={classes.filterLabel}
                      gutterBottom={false}
                    >
                      Group Member:
                    </Typography>
                    <GroupsMembersList
                      style={{ width: "auto" }}
                      groupsMembers={groupsMembers.map((g) => ({
                        ...g,
                        selected: true,
                      }))}
                      onItemClick={() => {}}
                    />
                  </Box>
                ) : null}
              </Grid>
              <Grid
                item
                lg={4}
                md={4}
                sm={12}
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  alignContent: "flex-end",
                }}
              >
                <EventsTotals
                  filters={filters}
                  totals={totals}
                  onFilterChange={onFilterChange}
                />
              </Grid>
            </Grid>
          </Toolbar>
        </AppBar>
      </Slide>
      {showFilters ? (
        <Slide mountOnEnter={true} appear={false} in={y < 100} direction="down">
          <Box width="100%" style={{ margin: 0 }}>
            {children}
          </Box>
        </Slide>
      ) : null}
    </Box>
  );
};

interface EventsToolbarProps extends EventsAppBarMinimalProps {}

const EventsAppBar: React.FC<EventsToolbarProps> = ({ children, ...props }) => {
  return <EventsAppBarMinimal {...props}>{children}</EventsAppBarMinimal>;
};
export default EventsAppBar;
