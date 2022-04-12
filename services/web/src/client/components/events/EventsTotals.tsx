import { Actor, Group, GroupMember, Keyword } from "@liexp/shared/io/http";
import { Documentary } from "@liexp/shared/io/http/Events";
import DatePicker from "@liexp/ui/components/Common/DatePicker";
import { EventIcon } from "@liexp/ui/components/Common/Icons/EventIcon";
import { AutocompleteActorInput } from "@liexp/ui/components/Input/AutocompleteActorInput";
import { AutocompleteGroupInput } from "@liexp/ui/components/Input/AutocompleteGroupInput";
import { AutocompleteGroupMemberInput } from "@liexp/ui/components/Input/AutocompleteGroupMemberInput";
import { AutocompleteKeywordInput } from '@liexp/ui/components/Input/AutocompleteKeywordInput';
import QueriesRenderer from "@liexp/ui/components/QueriesRenderer";
import { getTotal } from "@liexp/ui/helpers/event.helper";
import {
  SearchEventQueryInput,
  searchEventsQuery
} from "@liexp/ui/state/queries/SearchEventsQuery";
import {
  alpha,
  Box,
  Grid,
  IconButton,
  InputBase,
  makeStyles,
  Typography
} from "@material-ui/core";
import ArrowDownIcon from "@material-ui/icons/ArrowDownward";
import ArrowUpIcon from "@material-ui/icons/ArrowUpward";
import SearchIcon from "@material-ui/icons/Search";
import clsx from "clsx";
import * as React from "react";

const useStyles = makeStyles((theme) => ({
  iconButton: {
    marginRight: 10,
    opacity: 0.5,
  },
  iconButtonSelected: {
    opacity: 1,
  },
  search: {
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
  searchIcon: {
    padding: theme.spacing(0, 2),
    height: "100%",
    position: "absolute",
    pointerEvents: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  dateInput: {
    marginBottom: theme.spacing(2),
  },
  inputRoot: {
    color: "inherit",
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("md")]: {
      width: "20ch",
    },
  },
}));

type Query = Omit<SearchEventQueryInput, "hash" | "_start" | "_end">;
export interface EventsTotalsProps {
  query: Query;
  hash: string;
  keywords: Keyword.Keyword[]
  actors: Actor.Actor[];
  groups: Group.Group[];
  groupsMembers: GroupMember.GroupMember[];
  filters: {
    uncategorized: boolean;
    deaths: boolean;
    scientificStudies: boolean;
    patents: boolean;
    documentaries: boolean;
    transactions: boolean;
  };
  onFilterChange: (f: EventsTotalsProps["filters"]) => void;
  onQueryChange: (q: Query) => void;
}

const EventsTotals: React.FC<EventsTotalsProps> = ({
  query,
  hash,
  keywords,
  actors,
  groups,
  groupsMembers,
  filters,
  onFilterChange,
  onQueryChange,
}) => {
  const classes = useStyles();

  const [title, setTitle] = React.useState(query.title ?? "");

  const [currentDateRange, setCurrentDateRange] = React.useState([
    query.startDate,
    query.endDate,
  ]);

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
        const totalEvents = getTotal(totals, filters);
        return (
          <Box width="100%">
            <Box display="flex">
              <Grid container>
                <Grid item md={6}>
                  <div className={classes.search}>
                    <div className={classes.searchIcon}>
                      <SearchIcon />
                    </div>
                    <InputBase
                      placeholder="Search…"
                      classes={{
                        root: classes.inputRoot,
                        input: classes.inputInput,
                      }}
                      value={title}
                      inputProps={{ "aria-label": "search" }}
                      onChange={(e) => {
                        setTitle(e.target.value);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          onQueryChange({
                            ...query,
                            title: title === "" ? undefined : title,
                          });
                        }
                      }}
                    />
                  </div>
                </Grid>
                <Grid item md={3} sm={4} xs={6}>
                  <DatePicker
                    className={classes.dateInput}
                    size="small"
                    value={currentDateRange[0]}
                    variant="standard"
                    datatype="date"
                    InputLabelProps={{
                      disabled: true,
                    }}
                    onChange={(e) =>
                      setCurrentDateRange([e.target.value, currentDateRange[1]])
                    }
                    onBlur={(e) => {
                      onQueryChange({
                        ...query,
                        startDate: e.target.value,
                        endDate: currentDateRange[1],
                      });
                    }}
                    style={{ width: "100%" }}
                  />
                </Grid>
                <Grid item md={3} sm={4} xs={6}>
                  <DatePicker
                    className={classes.dateInput}
                    size="small"
                    value={currentDateRange[1]}
                    variant="standard"
                    InputLabelProps={{
                      disabled: true,
                    }}
                    onChange={(e) =>
                      setCurrentDateRange([currentDateRange[0], e.target.value])
                    }
                    onBlur={(e) =>
                      onQueryChange({
                        ...query,
                        startDate: currentDateRange[1],
                        endDate: e.target.value,
                      })
                    }
                    style={{ width: "100%" }}
                  />
                </Grid>
              </Grid>
            </Box>
            <Box display="flex">
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <AutocompleteKeywordInput
                    selectedItems={keywords}
                    onItemClick={(kk) => {
                      onQueryChange({
                        ...query,
                        keywords: kk.map((k) => k.id),
                      });
                    }}
                  />
                </Grid>
                <Grid item md={12} sm={6} xs={6}>
                  <AutocompleteActorInput
                    selectedItems={actors}
                    onChange={(aa) =>
                      onQueryChange({
                        ...query,
                        actors: aa.map((a) => a.id),
                      })
                    }
                  />
                </Grid>
              </Grid>
              <Grid item md={12} sm={6} xs={6}>
                <AutocompleteGroupInput
                  selectedItems={groups}
                  onChange={(gg) =>
                    onQueryChange({
                      ...query,
                      groups: gg.map((g) => g.id),
                    })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <AutocompleteGroupMemberInput
                  selectedItems={groupsMembers}
                  onItemClick={(gms) =>
                    onQueryChange({
                      ...query,
                      groupsMembers: gms.map((gm) => gm.id),
                    })
                  }
                />
              </Grid>
            </Box>
            <Box display="flex">
              <IconButton
                className={clsx(classes.iconButton, {
                  [classes.iconButtonSelected]: filters.uncategorized,
                })}
                color="primary"
                style={{ marginRight: 10 }}
                onClick={() => {
                  onFilterChange({
                    ...filters,
                    uncategorized: !filters.uncategorized,
                  });
                }}
              >
                <EventIcon type="Uncategorized" style={{ marginRight: 10 }} />
                <Typography variant="caption">
                  {totals.uncategorized}
                </Typography>
              </IconButton>
              <IconButton
                color="primary"
                className={clsx(classes.iconButton, {
                  [classes.iconButtonSelected]: filters.deaths,
                })}
                onClick={() => {
                  onFilterChange({
                    ...filters,
                    deaths: !filters.deaths,
                  });
                }}
              >
                <EventIcon type="Death" style={{ marginRight: 10 }} />
                <Typography variant="caption">{totals.deaths}</Typography>
              </IconButton>
              <IconButton
                color="primary"
                className={clsx(classes.iconButton, {
                  [classes.iconButtonSelected]: filters.scientificStudies,
                })}
                onClick={() => {
                  onFilterChange({
                    ...filters,
                    scientificStudies: !filters.scientificStudies,
                  });
                }}
              >
                <EventIcon type="ScientificStudy" style={{ marginRight: 10 }} />
                <Typography variant="caption">
                  {totals.scientificStudies}
                </Typography>
              </IconButton>
              <IconButton
                color="primary"
                className={clsx(classes.iconButton, {
                  [classes.iconButtonSelected]: filters.documentaries,
                })}
                onClick={() => {
                  onFilterChange({
                    ...filters,
                    documentaries: !filters.documentaries,
                  });
                }}
              >
                <EventIcon
                  type={Documentary.DOCUMENTARY.value}
                  style={{ marginRight: 10 }}
                />
                <Typography variant="caption">
                  {totals.documentaries}
                </Typography>
              </IconButton>
              <IconButton
                color="primary"
                className={clsx(classes.iconButton, {
                  [classes.iconButtonSelected]: filters.patents,
                })}
                onClick={() => {
                  onFilterChange({
                    ...filters,
                    patents: !filters.patents,
                  });
                }}
              >
                <EventIcon type="Patent" style={{ marginRight: 10 }} />
                <Typography variant="caption">{totals.patents}</Typography>
              </IconButton>
              <IconButton
                color="primary"
                className={clsx(classes.iconButton, {
                  [classes.iconButtonSelected]: filters.transactions,
                })}
                onClick={() => {
                  onFilterChange({
                    ...filters,
                    transactions: !filters.transactions,
                  });
                }}
              >
                <EventIcon type="Transaction" style={{ marginRight: 10 }} />
                <Typography variant="caption">{totals.transactions}</Typography>
              </IconButton>
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
                onClick={() => {
                  onQueryChange({
                    ...query,
                    _order: query._order === "DESC" ? "ASC" : "DESC",
                  });
                }}
              >
                {query._order === "DESC" ? <ArrowDownIcon /> : <ArrowUpIcon />}
              </IconButton>
            </Box>
          </Box>
        );
      }}
    />
  );
};

export default EventsTotals;
