import { type Actor, type Group, type GroupMember, type Keyword } from "@liexp/shared/io/http";
import * as React from "react";
import {
  searchEventsQuery,
  type SearchEventsQueryInputNoPagination,
} from "../../state/queries/SearchEventsQuery";
import { styled, useTheme } from "../../theme";
import { DateRangePicker } from "../Common/DateRangePicker";
import QueriesRenderer from "../QueriesRenderer";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  alpha,
  Box,
  Grid,
  SearchIcon,
  Toolbar,
  Typography,
} from "../mui";
import { EventsAppBarMinimized } from "./EventsAppBarMinimized";
import SearchEventInput, { type SearchOption } from "./inputs/SearchEventInput";

const PREFIX = "EventsAppBar";

const classes = {
  filterBox: `${PREFIX}-filterBox`,
  filterLabel: `${PREFIX}-filterLabel`,
  filterValue: `${PREFIX}-filterValue`,
  offset: `${PREFIX}-offset`,
  search: `${PREFIX}-search`,
  searchIcon: `${PREFIX}-searchIcon`,
  inputRoot: `${PREFIX}-inputRoot`,
  inputInput: `${PREFIX}-inputInput`,
  tabs: `${PREFIX}-tabs`,
  expandedBox: `${PREFIX}-expanded-box`,
};

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  [`& .${classes.filterBox}`]: {
    display: "flex",
    alignItems: "center",
  },

  [`& .${classes.filterLabel}`]: {
    marginBottom: 0,
    marginRight: theme.spacing(1),
  },

  [`& .${classes.filterValue}`]: {
    marginRight: theme.spacing(1),
  },

  [`& .${classes.offset}`]: {
    height: 200,
    minHeight: 200,
  },

  [`& .${classes.search}`]: {
    position: "relative",
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    "&:hover": {
      backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
    marginRight: theme.spacing(2),
    marginBottom: theme.spacing(1),
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      width: "auto",
    },
  },

  [`& .${classes.searchIcon}`]: {
    padding: theme.spacing(0, 2, 0, 0),
    height: "100%",
    position: "absolute",
    pointerEvents: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  [`& .${classes.inputRoot}`]: {
    color: "inherit",
    paddingLeft: theme.spacing(3),
  },

  [`& .${classes.inputInput}`]: {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("md")]: {
      width: "20ch",
    },
  },

  [`& .${classes.tabs}`]: {
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      paddingTop: 20,
      display: "flex",
      alignItems: "center",
    },
  },
  [`& .${classes.expandedBox}`]: {
    display: "flex",
    flexDirection: "row",
    [theme.breakpoints.down("md")]: {
      flexDirection: "column",
    },
  },
}));

const serializeOption = (
  options: SearchOption[]
): {
  title: string | undefined;
  groups: Group.Group[];
  actors: Actor.Actor[];
  keywords: Keyword.Keyword[];
} => {
  return options.reduce(
    (acc, o) => {
      return {
        title: acc.title ?? (o.type === "Search" ? o.item : undefined),
        groups: acc.groups.concat(o.type === "Group" ? [o.item] : []),
        actors: acc.actors.concat(o.type === "Actor" ? [o.item] : []),
        keywords: acc.keywords.concat(o.type === "Keyword" ? [o.item] : []),
      };
    },
    {
      title: undefined as any as string,
      groups: [] as Group.Group[],
      actors: [] as Actor.Actor[],
      keywords: [] as Keyword.Keyword[],
    }
  );
};

interface EventsToolbarProps {
  query: SearchEventsQueryInputNoPagination;
  tab: number;
  hash: string;
  actors: Actor.Actor[];
  groups: Group.Group[];
  groupsMembers: GroupMember.GroupMember[];
  keywords: Keyword.Keyword[];
  onQueryChange: (e: SearchEventsQueryInputNoPagination, tab: number) => void;
  onQueryClear: () => void;
}

const EventsAppBar: React.FC<EventsToolbarProps> = ({
  query,
  tab,
  hash,
  actors,
  groups,
  groupsMembers,
  keywords,
  onQueryChange,
  onQueryClear,
}) => {
  const theme = useTheme();

  const [currentDateRange, setCurrentDateRange] = React.useState([
    query.startDate,
    query.endDate,
  ]);

  const [isExpanded, setIsExpanded] = React.useState(false);

  const handleSearchChange = (options: SearchOption[]): void => {
    const queryUpdate = serializeOption(options);

    onQueryChange(
      {
        ...query,
        ...queryUpdate,
        groups: (query.groups ?? []).concat(
          queryUpdate.groups.map((g) => g.id)
        ),
        actors: (query.actors ?? []).concat(
          queryUpdate.actors.map((g) => g.id)
        ),
        keywords: (query.keywords ?? []).concat(
          queryUpdate.keywords.map((g) => g.id)
        ),
      },
      tab
    );
  };

  return (
    <QueriesRenderer
      queries={{
        searchEvents: searchEventsQuery({
          ...query,
          hash,
          _start: 0,
          _end: 0,
        }),
      }}
      render={({ searchEvents: { totals } }) => {
        const searchBox = (
          <div className={classes.search}>
            <div className={classes.searchIcon}>
              <SearchIcon />
            </div>
            <SearchEventInput
              classes={{
                root: classes.inputRoot,
                input: classes.inputInput,
              }}
              query={query}
              onQueryChange={handleSearchChange}
            />
          </div>
        );

        const searchTermBox = query.title ? (
          <Box
            style={{
              display: "flex",
              alignItems: "center",
              marginRight: theme.spacing(2),
            }}
          >
            <Typography
              onClick={() => {
                if (isExpanded) {
                  onQueryChange(
                    {
                      ...query,
                      title: undefined,
                    },
                    tab
                  );
                }
              }}
              variant="subtitle1"
            >
              {query.title}
            </Typography>
          </Box>
        ) : null;

        const tabs = (
          <Grid
            item
            sm={12}
            md={12}
            lg={12}
            style={{
              display: "flex",
              justifyContent: "flex-end",
              flexDirection: "column",
              margin: "auto",
              width: "100%",
            }}
          >
            {/* <Tabs
              className={classes.tabs}
              value={tab}
              onChange={(e, tab) => onQueryChange({ ...query, tab })}
            >
              <Tab
                label="list"
                {...a11yProps(0)}
                style={{
                  display: "flex",
                  flexGrow: 1,
                  maxWidth: "100%",
                }}
              />
               <Tab
                label="map"
                {...a11yProps(1)}
                style={{
                  display: "flex",
                  flexGrow: 1,
                  maxWidth: "100%",
                }}
              />  <Tab
                label="network"
                {...a11yProps(1)}
                style={{
                  display: "flex",
                  flexGrow: 1,
                  maxWidth: "100%",
                }}
              /> 
            </Tabs> */}
          </Grid>
        );

        const expanded = (
          <Box>
            <Grid container className={classes.expandedBox}>
              <Grid item md={8} sm={6} xs={12}>
                {searchBox}
                {searchTermBox}
              </Grid>
              <Grid item xs={12}>
                <DateRangePicker
                  from={currentDateRange[0]}
                  to={currentDateRange[1]}
                  onDateRangeChange={([from, to]) => {
                    setCurrentDateRange([from, to]);
                  }}
                  onBlur={(e) => {
                    onQueryChange(
                      {
                        ...query,
                        startDate:
                          e.target.value === "" ? undefined : e.target.value,
                        endDate: currentDateRange[1],
                      },
                      tab
                    );
                  }}
                />
              </Grid>
              {tabs}
            </Grid>
          </Box>
        );

        return (
          <StyledToolbar
            disableGutters
            color="white"
            variant="dense"
            style={{
              // position: 'relative',
              // top: theme.mixins.toolbar.height,
              width: "100%",
              background: theme.palette.common.white,
            }}
          >
            <Accordion
              expanded={isExpanded}
              onChange={() => {
                setIsExpanded(!isExpanded);
              }}
              style={{ width: "100%" }}
            >
              <AccordionSummary>
                <EventsAppBarMinimized
                  open={isExpanded}
                  query={query}
                  tab={tab}
                  actors={actors.filter((a) => query.actors?.includes(a.id))}
                  groups={groups.filter((g) => query.groups?.includes(g.id))}
                  groupsMembers={groupsMembers.filter((gm) =>
                    query.groupsMembers?.includes(gm.id)
                  )}
                  keywords={keywords.filter((k) =>
                    query.keywords?.includes(k.id)
                  )}
                  totals={totals}
                  onQueryChange={onQueryChange}
                  onQueryClear={onQueryClear}
                />
              </AccordionSummary>
              <AccordionDetails>{expanded}</AccordionDetails>
            </Accordion>
          </StyledToolbar>
        );
      }}
    />
  );
};
export default EventsAppBar;
