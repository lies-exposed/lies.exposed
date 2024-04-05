import {
  type GetListQuery,
  type GetListQueryActors,
  type GetListQueryDateRange,
  type GetListQueryGroups,
  type GetListQueryKeywords,
} from "@liexp/shared/lib/io/http/Query/GetListQuery.js";
import { parseISO, subYears } from "date-fns";
import * as React from "react";
import { type serializedType } from "ts-io-error/lib/Codec.js";
import ActorsBox from "../../../containers/ActorsBox.js";
import { GroupsBox } from "../../../containers/GroupsBox.js";
import { styled, useTheme } from "../../../theme/index.js";
import {
  DateRangePicker,
  DateRangeSlider,
} from "../../Common/DateRangePicker.js";
import { KeywordsBox } from "../../KeywordsBox.js";
import SearchEventInput from "../../events/inputs/SearchEventInput.js";
import {
  Box,
  Grid,
  IconButton,
  Icons,
  Stack,
  Typography,
  alpha,
} from "../../mui/index.js";

export type SearchFilters = Omit<
  serializedType<typeof GetListQuery>,
  "_start" | "_end"
> &
  serializedType<typeof GetListQueryActors> &
  serializedType<typeof GetListQueryGroups> &
  serializedType<typeof GetListQueryKeywords> &
  serializedType<typeof GetListQueryDateRange>;

const PREFIX = "SearchFiltersBar";

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
      width: "100%",
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

export interface SearchFiltersBarProps {
  className?: string;
  query: Partial<SearchFilters>;
  current?: number;
  layout?: Partial<{
    searchBox: number;
    dateRangeBox: { columns: number; variant: "slider" | "picker" };
    relations: number;
  }>;
  defaultExpanded?: boolean;
  dateRange?: [Date, Date];
  onQueryChange: (e: SearchFilters) => void;
  onQueryClear: () => void;
}

const SearchFiltersBar: React.FC<SearchFiltersBarProps> = ({
  query,
  dateRange: _dateRange,
  onQueryChange,
  defaultExpanded = false,
  onQueryClear,
  ...props
}) => {
  const theme = useTheme();

  const startDate = query.startDate
    ? parseISO(query.startDate)
    : subYears(new Date(), 1);
  const endDate = query.endDate ? parseISO(query.endDate) : new Date();
  const dateRange = _dateRange ?? [startDate, endDate];

  const currentDateRange = [startDate, endDate];

  const handleQueryChange = (queryUpdate: Partial<SearchFilters>): void => {
    const newQuery = {
      ...query,
      ...queryUpdate,
      q: queryUpdate.q ?? undefined,
      groups: queryUpdate?.groups ? queryUpdate.groups : query.groups,
      actors: queryUpdate?.actors ? queryUpdate.actors : query.actors,
      keywords: queryUpdate?.keywords ? queryUpdate.keywords : query.keywords,
      startDate: queryUpdate.startDate
        ? queryUpdate.startDate
        : query.startDate,
      endDate: queryUpdate.endDate ? queryUpdate.endDate : query.endDate,
      _sort: queryUpdate._sort ?? query._sort ?? null,
      _order: queryUpdate._order ?? query._order ?? null,
    };
    onQueryChange(newQuery);
  };

  const hasActiveFilters = React.useMemo(() => {
    return (
      (query.actors?.length ?? 0) > 0 ??
      (query.groups?.length ?? 0) > 0 ??
      (query.keywords?.length ?? 0) > 0 ??
      query.startDate ??
      query.endDate
    );
  }, [query]);

  const clearButton = hasActiveFilters ? (
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
        query={{
          hash: "",
          ...query,
        }}
        onQueryChange={(u) => {
          // console.log("on search event input change", u);
          handleQueryChange({
            actors: u.actors.map((a) => a.id),
            groups: u.groups.map((a) => a.id),
            keywords: u.keywords.map((a) => a.id),
            q: u.q,
          });
        }}
      />
    </div>
  );

  const searchTermBox = query.q ? (
    <Box
      style={{
        display: "flex",
        alignItems: "center",
        marginRight: theme.spacing(2),
      }}
    >
      <Typography
        onClick={() => {
          handleQueryChange({
            ...query,
            q: undefined,
          });
        }}
        variant="subtitle1"
      >
        {query.q}
      </Typography>
    </Box>
  ) : null;

  const actorsList = query.actors ? (
    <ActorsBox
      style={{
        display: "flex",
        flexDirection: "row",
      }}
      params={{ filter: { ids: query.actors } }}
      onActorClick={(a, e) => {
        e.stopPropagation();
        handleQueryChange({
          actors: (query.actors ?? []).filter((actorId) => actorId !== a.id),
        });
      }}
    />
  ) : null;

  const layout: Required<SearchFiltersBarProps["layout"]> = {
    searchBox: 12,
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
        flexDirection: "row",
      }}
    >
      <Grid container spacing={2} style={{ width: "100%" }}>
        <Grid item md={11} sm={10}>
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
              flexGrow: 1,
            }}
            // onClick={}
          >
            <KeywordsBox
              style={{
                display: "flex",
                flexDirection: "row",
              }}
              ids={query.keywords ?? []}
              onItemClick={(k, e) => {
                e.stopPropagation();
                handleQueryChange({
                  keywords: (query.keywords ?? []).filter((g) => k.id !== g),
                });
              }}
            />
          </Grid>
          <Grid>
            <Stack
              style={{
                display: "flex",
                flexWrap: "wrap",
                flexDirection: "row",
                flexShrink: 0,
              }}
              // onClick={handleGroupClick}
            >
              {query.groups ? (
                <GroupsBox
                  style={{
                    display: "flex",
                    flexDirection: "row",
                  }}
                  params={{ filter: { ids: query.groups } }}
                  onItemClick={(k, e) => {
                    e.stopPropagation();
                    const groups = (query.groups ?? []).filter(
                      (g) => k.id !== g,
                    );

                    handleQueryChange({
                      groups,
                    });
                  }}
                />
              ) : null}
              {actorsList}

              {layout.dateRangeBox?.variant === "slider" ? (
                <DateRangeSlider
                  minDate={dateRange[0]}
                  maxDate={dateRange[1]}
                  from={currentDateRange[0]}
                  to={currentDateRange[1]}
                  onDateRangeChange={([from, to]) => {
                    handleQueryChange({
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
                    handleQueryChange({
                      startDate: from?.toISOString(),
                      endDate: to?.toISOString(),
                    });
                  }}
                />
              )}
            </Stack>
          </Grid>
        </Grid>
        <Grid item md={1} sm={2}>
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
          </Box>
        </Grid>
      </Grid>
    </StyledBox>
  );
};
export default SearchFiltersBar;
