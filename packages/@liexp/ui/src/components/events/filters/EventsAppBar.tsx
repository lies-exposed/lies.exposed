import { getTotal } from "@liexp/shared/lib/helpers/event/index.js";
import { type EventTotals } from "@liexp/shared/lib/io/http/Events/EventTotals.js";
import { EventTypes } from "@liexp/shared/lib/io/http/Events/EventType.js";
import {
  type EventType,
  type SearchEvent,
} from "@liexp/shared/lib/io/http/Events/index.js";
import {
  type Actor,
  type Group,
  type GroupMember,
  type Keyword,
} from "@liexp/shared/lib/io/http/index.js";
import { parseISO, subYears } from "date-fns";
import * as React from "react";
import { usePopover } from "../../../hooks/usePopover.js";
import { type SearchEventsQueryInputNoPagination } from "../../../state/queries/SearchEventsQuery.js";
import { styled, useTheme } from "../../../theme/index.js";
import {
  DateRangePicker,
  DateRangeSlider,
} from "../../Common/DateRangePicker.js";
import { AutocompleteActorInput } from "../../Input/AutocompleteActorInput.js";
import { AutocompleteGroupInput } from "../../Input/AutocompleteGroupInput.js";
import { AutocompleteKeywordInput } from "../../Input/AutocompleteKeywordInput.js";
import { ActorList } from "../../lists/ActorList.js";
import GroupList from "../../lists/GroupList.js";
import { GroupsMembersList } from "../../lists/GroupMemberList.js";
import KeywordList from "../../lists/KeywordList.js";
import {
  Box,
  Grid,
  IconButton,
  Typography,
  alpha,
  Icons,
} from "../../mui/index.js";
import SearchEventInput, {
  type SearchFilter,
} from "../inputs/SearchEventInput.js";
import { EventTypeFilters, type EventTypeMap } from "./EventTypeFilters.js";
import { searchEventQueryToEventTypeFilters } from "./EventsAppBarMinimized.js";

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
  eventTotal: `${PREFIX}-eventTotal`,
  tabs: `${PREFIX}-tabs`,
  expandedBox: `${PREFIX}-expanded-box`,
};

const StyledBox = styled(Box)(({ theme }) => ({
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
  [`& .${classes.eventTotal}`]: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
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

export interface EventsAppBarProps {
  className?: string;
  query: SearchEventsQueryInputNoPagination;
  current?: number;
  actors: Actor.Actor[];
  groups: Group.Group[];
  keywords: Keyword.Keyword[];
  groupsMembers: GroupMember.GroupMember[];
  layout?: Partial<{
    searchBox: number;
    eventTypes: number;
    dateRangeBox: { columns: number; variant: "slider" | "picker" };
    relations: number;
  }>;
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

  const startDate = query.startDate
    ? parseISO(query.startDate)
    : _dateRange?.[0] ?? subYears(new Date(), 1);
  const endDate = query.endDate
    ? parseISO(query.endDate)
    : _dateRange?.[1] ?? new Date();
  const dateRange = _dateRange ?? [startDate, endDate];
  const currentDateRange = [startDate, endDate];

  const actorPopoverRef = React.createRef<HTMLDivElement>();
  const [filterPopover, showPopover] = usePopover({
    disablePortal: false,
  });

  const handleFilterChange = React.useCallback(
    (ff: EventTypeMap, filterK: EventType) => {
      const type = [
        [ff.Uncategorized, EventTypes.UNCATEGORIZED.value],
        [ff.Death, EventTypes.DEATH.value],
        [ff.Documentary, EventTypes.DOCUMENTARY.value],
        [ff.Patent, EventTypes.PATENT.value],
        [ff.ScientificStudy, EventTypes.SCIENTIFIC_STUDY.value],
        [ff.Transaction, EventTypes.TRANSACTION.value],
        [ff.Quote, EventTypes.QUOTE.value],
        [ff.Book, EventTypes.BOOK.value],
      ]
        .map(([enabled, key]: any[]) => (enabled ? key : undefined))
        .filter((a) => a !== undefined);

      onQueryChange({
        ...query,
        eventType: type,
      });
    },
    [query],
  );

  const handleQueryChange = (queryUpdate: Partial<SearchFilter>): void => {
    onQueryChange({
      ...query,
      ...queryUpdate,
      groups: queryUpdate?.groups?.map((g) => g.id) ?? query.groups,
      actors: queryUpdate?.actors?.map((g) => g.id) ?? query.actors,
      keywords: queryUpdate?.keywords?.map((g) => g.id) ?? query.keywords,
    });
  };

  const filters = React.useMemo(() => {
    const events = searchEventQueryToEventTypeFilters(query);

    return {
      events,
      actors: actors.reduce(
        (acc, a) =>
          query.actors?.includes(a.id)
            ? {
                ...acc,
                selected: acc.selected.concat({ ...a, selected: true }),
              }
            : {
                ...acc,
                unselected: acc.unselected.concat({ ...a, selected: false }),
              },
        { selected: [] as any[], unselected: [] as any[] },
      ),
      groups: groups.reduce(
        (acc, a) =>
          query.groups?.includes(a.id)
            ? {
                ...acc,
                selected: acc.selected.concat({ ...a, selected: true }),
              }
            : {
                ...acc,
                unselected: acc.unselected.concat({ ...a, selected: false }),
              },
        { selected: [] as any[], unselected: [] as any[] },
      ),
      keywords: keywords.reduce(
        (acc, a) =>
          query.keywords?.includes(a.id)
            ? {
                ...acc,
                selected: acc.selected.concat({ ...a, selected: true }),
              }
            : {
                ...acc,
                unselected: acc.unselected.concat({ ...a, selected: false }),
              },
        { selected: [] as any[], unselected: [] as any[] },
      ),
    };
  }, [query, actors, groups, keywords, groupsMembers]);

  const totalEvents = getTotal(totals, {
    transactions: filters.events.Transaction,
    documentaries: filters.events.Documentary,
    uncategorized: filters.events.Uncategorized,
    patents: filters.events.Patent,
    scientificStudies: filters.events.ScientificStudy,
    deaths: filters.events.Death,
    quotes: filters.events.Quote,
    books: filters.events.Book,
  });

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
        <Icons.HighlightOff />
      </IconButton>
    ) : null;

  const eventTotal = (
    <Box className={classes.eventTotal}>
      <Typography display="flex" variant="h5" color="secondary" margin={0}>
        {totalEvents}
      </Typography>
      <Box margin={0}>
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
          {query._order === "DESC" ? <Icons.ArrowUp /> : <Icons.ArrowDown />}
        </IconButton>
      </Box>
    </Box>
  );

  const searchBox = (
    <div className={classes.search}>
      <div className={classes.searchIcon}>
        <Icons.Search />
      </div>
      <SearchEventInput
        classes={{
          root: classes.inputRoot,
          input: classes.inputInput,
        }}
        query={query}
        onQueryChange={(u) => {
          handleQueryChange({
            actors: actors.concat(u.actors),
            groups: groups.concat(u.groups),
            keywords: keywords.concat(u.keywords),
            search: u.search,
          });
        }}
      />
    </div>
  );

  const searchTermBox = query.search ? (
    <Box
      style={{
        display: "flex",
        alignItems: "center",
        marginRight: theme.spacing(2),
      }}
    >
      <Typography
        onClick={() => {
          onQueryChange({
            ...query,
            search: undefined,
          });
        }}
        variant="subtitle1"
      >
        {query.search}
      </Typography>
    </Box>
  ) : null;

  const handleActorClick = (e: any): void => {
    showPopover("Filter actors", e.currentTarget, (onClose) => {
      return (
        <AutocompleteActorInput
          selectedItems={filters.actors.selected.map((a) => ({
            ...a,
            selected: true,
          }))}
          discrete={false}
          options={
            filters.actors.unselected.length > 0
              ? filters.actors.unselected.map((a) => ({
                  ...a,
                  selected: true,
                }))
              : undefined
          }
          onChange={(a) => {
            handleQueryChange({
              actors: a,
            });
            onClose();
          }}
        />
      );
    });
  };
  const actorsList = (
    <ActorList
      style={{
        display: "flex",
        flexDirection: "row",
      }}
      actors={filters.actors.selected}
      onActorClick={(a, e) => {
        e.stopPropagation();
        handleQueryChange({
          actors: filters.actors.selected.filter((aa) => aa.id !== a.id),
        });
      }}
    />
  );

  const handleGroupClick = (e: any): void => {
    showPopover("Filter groups", e.currentTarget, (onClose) => {
      return (
        <AutocompleteGroupInput
          selectedItems={filters.groups.selected.map((g) => ({
            ...g,
            selected: true,
          }))}
          discrete={false}
          options={
            filters.groups.unselected.length > 0
              ? filters.groups.unselected.map((a) => ({
                  ...a,
                  selected: true,
                }))
              : undefined
          }
          onChange={(k) => {
            handleQueryChange({
              groups: k,
            });
            onClose();
          }}
        />
      );
    });
  };

  const handleKeywordClick = (e: any): void => {
    showPopover("Filter keywords", e.currentTarget, (onClose) => {
      return (
        <AutocompleteKeywordInput
          selectedItems={filters.keywords.selected.map((g) => ({
            ...g,
            selected: true,
          }))}
          discrete={false}
          options={
            filters.keywords.unselected.length > 0
              ? filters.keywords.unselected.map((a) => ({
                  ...a,
                  selected: true,
                }))
              : undefined
          }
          onChange={(k) => {
            handleQueryChange({
              keywords: k,
            });
            onClose();
          }}
        />
      );
    });
  };

  const groupsMembersList = (
    <GroupsMembersList
      groupsMembers={groupsMembers.map((g) => ({ ...g, selected: true }))}
      onItemClick={(gm) => {
        onQueryChange({
          ...query,
          groupsMembers: query.groupsMembers?.filter((g) => gm.id !== g),
        });
      }}
    />
  );

  const layout: Required<EventsAppBarProps["layout"]> = {
    searchBox: 3,
    eventTypes: 4,
    relations: 3,
    ...props.layout,
    dateRangeBox: {
      columns: 12,
      variant: "slider",
      ...props.layout?.dateRangeBox,
    },
  };

  return (
    <StyledBox
      style={{
        width: "100%",
        display: "flex",
        flexShrink: 0,
      }}
    >
      <Grid container spacing={2}>
        <Grid item md={10} sm={10}>
          <Box
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "row",
              flexWrap: "wrap",
              background: "white",
            }}
          >
            <Grid container spacing={2}>
              <Grid item md={layout.searchBox} sm={12} xs={12}>
                {searchBox}
                {searchTermBox}
              </Grid>
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
                onClick={handleKeywordClick}
              >
                {filters.keywords.selected.length === 0 ? (
                  <Typography>Select a keyword</Typography>
                ) : null}
                <KeywordList
                  style={{
                    display: "flex",
                    flexDirection: "row",
                  }}
                  keywords={filters.keywords.selected}
                  onItemClick={(k, e) => {
                    e.stopPropagation();
                    handleQueryChange({
                      keywords: filters.keywords.selected.filter(
                        (g) => k.id !== g.id,
                      ),
                    });
                  }}
                />
              </Grid>

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
                onClick={handleGroupClick}
              >
                {filters.groups.selected.length === 0 ? (
                  <Typography>Select a group</Typography>
                ) : (
                  <GroupList
                    style={{
                      display: "flex",
                      flexDirection: "row",
                    }}
                    groups={filters.groups.selected}
                    onItemClick={(k, e) => {
                      e.stopPropagation();
                      const groups = filters.groups.selected.filter(
                        (g) => k.id !== g.id,
                      );

                      handleQueryChange({
                        groups,
                      });
                    }}
                  />
                )}
                {groupsMembersList}
              </Grid>

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
                ref={actorPopoverRef}
                onClick={handleActorClick}
              >
                {filters.actors.selected.length === 0 ? (
                  <Typography>Select an actor</Typography>
                ) : null}
                {actorsList}
              </Grid>
              {filterPopover}
              <Grid
                item
                sm={8}
                md={layout.eventTypes}
                lg={layout.eventTypes}
                style={{
                  display: "flex",
                  flexDirection: "row",
                  flexWrap: "wrap",
                  width: "100%",
                }}
              >
                <EventTypeFilters
                  filters={filters.events}
                  totals={totals}
                  onChange={handleFilterChange}
                />
              </Grid>
              <Grid
                item
                xs={12}
                sm={12}
                md={layout.dateRangeBox?.columns ?? 12}
                lg={layout.dateRangeBox?.columns ?? 12}
              >
                {layout.dateRangeBox?.variant === "slider" ? (
                  <DateRangeSlider
                    minDate={dateRange[0]}
                    maxDate={dateRange[1]}
                    from={currentDateRange[0]}
                    to={currentDateRange[1]}
                    onDateRangeChange={([from, to]) => {
                      onQueryChange({
                        ...query,
                        startDate: from?.toISOString(),
                        endDate: to?.toISOString(),
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
                        startDate: from?.toISOString(),
                        endDate: to?.toISOString(),
                      });
                    }}
                  />
                )}
              </Grid>
            </Grid>
          </Box>
        </Grid>
        <Grid item md={2} sm={2}>
          <Box
            style={{
              display: "flex",
              flexDirection: "column",
              flexShrink: 0,
              alignItems: "center",
              paddingRight: 16,
            }}
          >
            <Box
              style={{
                display: "flex",
              }}
            >
              {clearButton}
            </Box>
            {eventTotal}
          </Box>
        </Grid>
      </Grid>
    </StyledBox>
  );
};
export default EventsAppBar;
