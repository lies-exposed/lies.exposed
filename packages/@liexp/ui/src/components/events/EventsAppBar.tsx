import { getTotal } from "@liexp/shared/lib/helpers/event";
import { type SearchEvent } from "@liexp/shared/lib/io/http/Events";
import { type EventTotals } from "@liexp/shared/lib/io/http/Events/SearchEventsQuery";
import ArrowDownIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpIcon from "@mui/icons-material/ArrowUpward";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import { subYears } from "date-fns";
import * as React from "react";
import { type SearchEventsQueryInputNoPagination } from "../../state/queries/SearchEventsQuery";
import { styled, useTheme } from "../../theme";
import { DateRangePicker, DateRangeSlider } from "../Common/DateRangePicker";
import { ExpandableActorList } from "../lists/ActorList";
import { ExpandableGroupList } from "../lists/GroupList";
import { GroupsMembersList } from "../lists/GroupMemberList";
import { ExpandableKeywordList } from "../lists/KeywordList";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Grid,
  IconButton,
  SearchIcon,
  Typography,
  alpha,
} from "../mui";
import {
  EventsAppBarMinimized,
  searchEventQueryToEventTypeFilters,
  type EventsAppBarMinimizedProps,
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
    padding: 0,
  },
}));

export interface EventsAppBarProps
  extends Omit<EventsAppBarMinimizedProps, "filters" | "totals" | "open"> {
  defaultExpanded?: boolean;
  events: SearchEvent.SearchEvent[];
  dateRange?: [Date, Date];
  onQueryChange: (e: SearchEventsQueryInputNoPagination) => void;
  onQueryClear: () => void;
  totals: EventTotals;
}

const EventsAppBar: React.FC<EventsAppBarProps> = ({
  query,
  dateRange: _dateRange,
  actors,
  groups,
  groupsMembers,
  keywords,
  onQueryChange,
  defaultExpanded = false,
  onQueryClear,
  totals,
  events,
  ...props
}) => {
  const theme = useTheme();

  const currentDateRange = [query.startDate, query.endDate];

  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);

  const handleQueryChange = (queryUpdate: Partial<SearchFilter>): void => {
    onQueryChange({
      ...query,
      ...queryUpdate,
      groups: (query.groups ?? []).concat(
        (queryUpdate?.groups ?? []).map((g) => g.id)
      ),
      actors: (query.actors ?? []).concat(
        (queryUpdate?.actors ?? []).map((g) => g.id)
      ),
      keywords: (query.keywords ?? []).concat(
        (queryUpdate?.keywords ?? []).map((g) => g.id)
      ),
    });
  };

  const filters = searchEventQueryToEventTypeFilters(query);

  const totalEvents = getTotal(totals, {
    transactions: filters.Transaction,
    documentaries: filters.Documentary,
    uncategorized: filters.Uncategorized,
    patents: filters.Patent,
    scientificStudies: filters.ScientificStudy,
    deaths: filters.Death,
    quotes: filters.Quote,
  });

  const dateRange = _dateRange ?? [subYears(new Date(), 1), new Date()];

  const clearButton =
    actors.length > 0 || groups.length > 0 || keywords.length > 0 ? (
      <IconButton
        style={{
          padding: 0,
        }}
        onClick={(e) => {
          e.stopPropagation();
          onQueryClear();
        }}
        size="large"
      >
        <HighlightOffIcon />
      </IconButton>
    ) : null;

  const eventTotal = (
    <Box
      style={{
        display: "flex",
        width: "100%",
        flexGrow: 1,
        justifyContent: "flex-end",
      }}
    >
      <Typography
        display="inline"
        variant="h5"
        color="secondary"
        style={{
          margin: "auto",
          marginRight: 0,
        }}
      >
        {totalEvents}
      </Typography>
      <IconButton
        style={{
          padding: 20,
        }}
        onClick={(e) => {
          e.stopPropagation();
          onQueryChange({
            ...query,
            _order: query._order === "DESC" ? "ASC" : "DESC",
          });
        }}
        size="large"
      >
        {query._order === "DESC" ? <ArrowUpIcon /> : <ArrowDownIcon />}
      </IconButton>
    </Box>
  );

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
        onQueryChange={handleQueryChange}
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

  const actorsList = (
    <ExpandableActorList
      style={{
        display: "flex",
        flexDirection: "row",
      }}
      actors={actors.sort(
        (a, b) => (b.selected ? 1 : 0) - (a.selected ? 1 : 0)
      )}
      onActorClick={(k) => {
        handleQueryChange({
          actors: actors
            .map((g) => ({
              ...g,
              selected: g.id === k.id ? !k.selected : g.selected,
            }))
            .filter((s) => s.selected),
        });
      }}
    />
  );

  const groupsList = (
    <ExpandableGroupList
      style={{
        display: "flex",
        flexDirection: "row",
      }}
      groups={groups.sort(
        (a, b) => (b.selected ? 1 : 0) - (a.selected ? 1 : 0)
      )}
      onItemClick={(k) => {
        if (isExpanded) {
          handleQueryChange({
            groups: groups
              .map((g) => ({
                ...g,
                selected: g.id === k.id ? !k.selected : g.selected,
              }))
              .filter((s) => s.selected),
          });
        }
      }}
    />
  );

  const keywordList = (
    <ExpandableKeywordList
      style={{
        display: "flex",
        flexDirection: "row",
      }}
      keywords={keywords.sort(
        (a, b) => (b.selected ? 1 : 0) - (a.selected ? 1 : 0)
      )}
      onItemClick={(k) => {
        if (isExpanded) {
          handleQueryChange({
            keywords: keywords
              .map((g) => ({
                ...g,
                selected: g.id === k.id ? !k.selected : g.selected,
              }))
              .filter((s) => s.selected),
          });
        }
      }}
    />
  );

  const groupsMembersList = (
    <GroupsMembersList
      groupsMembers={groupsMembers.map((g) => ({ ...g, selected: true }))}
      onItemClick={(gm) => {
        if (isExpanded) {
          onQueryChange({
            ...query,
            groupsMembers: query.groupsMembers?.filter((g) => gm.id !== g),
          });
        }
      }}
    />
  );

  const layout: Required<EventsAppBarMinimizedProps["layout"]> = {
    eventTypes: 4,
    dateRangeBox: {
      columns: 4,
      variant: "slider",
      ...props.layout?.dateRangeBox,
    },
    relations: 4,
    ...props.layout,
  };

  const expanded = (
    <Box
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
        background: "white",
        position: "absolute",
        zIndex: 9999,
      }}
    >
      <Grid container spacing={2}>
        {keywords.length > 0 ? (
          <Grid
            item
            sm={12}
            md={layout.relations}
            style={{
              display: "flex",
              flexWrap: "wrap",
              flexDirection: "row",
              flexShrink: 0,
            }}
          >
            {keywordList}
          </Grid>
        ) : null}
        {groups.length > 0 ? (
          <Grid
            item
            sm={12}
            md={layout.relations}
            style={{
              display: "flex",
              flexWrap: "wrap",
              flexDirection: "row",
              flexShrink: 0,
            }}
          >
            {groupsList}
            {groupsMembersList}
          </Grid>
        ) : null}
        {actors.length > 0 ? (
          <Grid
            item
            sm={12}
            md={layout.relations}
            style={{
              display: "flex",
              flexWrap: "wrap",
              flexDirection: "row",
              flexShrink: 0,
            }}
          >
            {actorsList}
          </Grid>
        ) : null}

        <Grid item md={12} sm={12} xs={12}>
          {searchBox}
          {searchTermBox}
        </Grid>
        <Grid item xs={12} sm={12} md={12} lg={12}>
          {props.layout?.dateRangeBox?.variant === "slider" ? (
            <DateRangeSlider
              minDate={dateRange[0]}
              maxDate={dateRange[1]}
              from={currentDateRange[0]}
              to={currentDateRange[1]}
              onDateRangeChange={([from, to]) => {
                onQueryChange({
                  ...query,
                  startDate: from,
                  endDate: to,
                });
              }}
            />
          ) : (
            <DateRangePicker
              minDate={dateRange[0]}
              maxDate={dateRange[1]}
              from={currentDateRange[0]}
              to={currentDateRange[1]}
              onDateRangeChange={([from, to]) => {
                onQueryChange({
                  ...query,
                  startDate: from,
                  endDate: to,
                });
              }}
            />
          )}
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
      <Grid container>
        <Grid item md={10} sm={10}>
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
                filters={filters}
                open={isExpanded}
                query={query}
                actors={actors}
                groups={groups}
                groupsMembers={groupsMembers}
                keywords={keywords}
                totals={totals}
                onQueryChange={onQueryChange}
              />
            </AccordionSummary>
            <AccordionDetails className={classes.expandedBox}>
              {expanded}
            </AccordionDetails>
          </Accordion>
        </Grid>
        <Grid
          item
          md={2}
          sm={2}
          style={{
            display: "flex",
            flexDirection: "row",
            flexShrink: 0,
            alignItems: "baseline",
          }}
        >
          <Box
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginRight: 20,
            }}
          >
            {clearButton}
          </Box>
          {eventTotal}
        </Grid>
      </Grid>
    </StyledToolbar>
  );
};
export default EventsAppBar;
