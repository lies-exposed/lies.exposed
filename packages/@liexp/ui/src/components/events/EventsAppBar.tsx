import {
  type Actor,
  type Group,
  type GroupMember,
  type Keyword,
} from "@liexp/shared/io/http";
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
  Typography,
} from "../mui";
import {
  EventsAppBarMinimized,
  EventsAppBarMinimizedProps,
} from "./EventsAppBarMinimized";
import SearchEventInput, { type SearchFilter } from "./inputs/SearchEventInput";

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

const StyledToolbar = styled(Box)(({ theme }) => ({
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

interface EventsToolbarProps extends Omit<EventsAppBarMinimizedProps, 'totals' | 'open'> {
  defaultExpanded?: boolean;
  hash: string;
  actors: Actor.Actor[];
  groups: Group.Group[];
  groupsMembers: GroupMember.GroupMember[];
  keywords: Keyword.Keyword[];
  onQueryChange: (e: SearchEventsQueryInputNoPagination) => void;
  onQueryClear: () => void;
}

const EventsAppBar: React.FC<EventsToolbarProps> = ({
  query,
  hash,
  actors,
  groups,
  groupsMembers,
  keywords,
  onQueryChange,
  defaultExpanded = false,
  ...props
}) => {
  const theme = useTheme();

  const [currentDateRange, setCurrentDateRange] = React.useState([
    query.startDate,
    query.endDate,
  ]);

  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);

  const handleSearchChange = (queryUpdate: SearchFilter): void => {
    onQueryChange({
      ...query,
      ...queryUpdate,
      groups: (query.groups ?? []).concat(queryUpdate.groups.map((g) => g.id)),
      actors: (query.actors ?? []).concat(queryUpdate.actors.map((g) => g.id)),
      keywords: (query.keywords ?? []).concat(
        queryUpdate.keywords.map((g) => g.id)
      ),
    });
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
                  onQueryChange({
                    ...query,
                    title: undefined,
                  });
                }
              }}
              variant="subtitle1"
            >
              {query.title}
            </Typography>
          </Box>
        ) : null;

        const expanded = (
          <Box
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "row",
              flexWrap: "wrap",
            }}
          >
            <Grid container spacing={2} className={classes.expandedBox}>
              <Grid item md={12} sm={12} xs={12}>
                {searchBox}
                {searchTermBox}
              </Grid>
              <Grid item xs={12} sm={12} md={12} lg={12}>
                <DateRangePicker
                  from={currentDateRange[0]}
                  to={currentDateRange[1]}
                  onDateRangeChange={([from, to]) => {
                    setCurrentDateRange([from, to]);
                  }}
                  onBlur={(e) => {
                    onQueryChange({
                      ...query,
                      startDate:
                        e.target.value === "" ? undefined : e.target.value,
                      endDate: currentDateRange[1],
                    });
                  }}
                />
              </Grid>
            </Grid>
          </Box>
        );

        return (
          <StyledToolbar
            style={{
              width: "100%",
              display: "flex",
              flexShrink: 0,
            }}
          >
            <Accordion
              expanded={isExpanded}
              onChange={(e) => {
                if (!e.isDefaultPrevented()) {
                  setIsExpanded(!isExpanded);
                }
              }}
              variant={undefined}
              style={{
                width: "100%",
                border: "none",
                boxShadow: "none",
                background: "transparent",
              }}
            >
              <AccordionSummary>
                <EventsAppBarMinimized
                  {...props}
                  open={isExpanded}
                  query={query}
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
