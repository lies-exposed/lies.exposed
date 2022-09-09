import { Actor, Group, GroupMember, Keyword } from "@liexp/shared/io/http";
import {
  Death,
  Documentary,
  Patent,
  ScientificStudy,
  Transaction,
  Uncategorized,
} from "@liexp/shared/io/http/Events";
import { DEATH } from "@liexp/shared/io/http/Events/Death";
import { DOCUMENTARY } from "@liexp/shared/io/http/Events/Documentary";
import { PATENT } from "@liexp/shared/io/http/Events/Patent";
import { SCIENTIFIC_STUDY } from "@liexp/shared/io/http/Events/ScientificStudy";
import { UNCATEGORIZED } from "@liexp/shared/io/http/Events/Uncategorized";
import DatePicker from "@liexp/ui/components/Common/DatePicker";
import QueriesRenderer from "@liexp/ui/components/QueriesRenderer";
import { ActorList } from "@liexp/ui/components/lists/ActorList";
import GroupList from "@liexp/ui/components/lists/GroupList";
import { GroupsMembersList } from "@liexp/ui/components/lists/GroupMemberList";
import KeywordList from "@liexp/ui/components/lists/KeywordList";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  alpha,
  Box,
  Grid,
  IconButton,
  Toolbar,
  Typography,
} from "@liexp/ui/components/mui";
import { getTotal } from "@liexp/ui/helpers/event.helper";
import { searchEventsQuery } from "@liexp/ui/state/queries/SearchEventsQuery";
import { styled, useTheme } from "@liexp/ui/theme";
import ArrowDownIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpIcon from "@mui/icons-material/ArrowUpward";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import SearchIcon from "@mui/icons-material/Search";
import * as R from "fp-ts/lib/Record";
import { pipe } from "fp-ts/lib/function";
import * as S from "fp-ts/lib/string";
import * as React from "react";
import { EventTypeFilters } from "./EventTypeFilters";
import SearchEventInput, { SearchOption } from "./inputs/SearchEventInput";
import { EventsQueryParams } from "@containers/EventsPanel";

const PREFIX = "EventsAppBar";

const classes = {
  filterBox: `${PREFIX}-filterBox`,
  filterLabel: `${PREFIX}-filterLabel`,
  filterValue: `${PREFIX}-filterValue`,
  offset: `${PREFIX}-offset`,
  search: `${PREFIX}-search`,
  searchIcon: `${PREFIX}-searchIcon`,
  dateInput: `${PREFIX}-dateInput`,
  inputRoot: `${PREFIX}-inputRoot`,
  inputInput: `${PREFIX}-inputInput`,
  tabs: `${PREFIX}-tabs`,
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

  [`& .${classes.dateInput}`]: {
    marginBottom: theme.spacing(2),
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
  }
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
  query: EventsQueryParams;
  hash: string;
  actors: Actor.Actor[];
  groups: Group.Group[];
  groupsMembers: GroupMember.GroupMember[];
  keywords: Keyword.Keyword[];
  onQueryChange: (e: EventsQueryParams) => void;
  onQueryClear: () => void;
}

const EventsAppBar: React.FC<EventsToolbarProps> = ({
  query: { tab, ...query },
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

  const [filters, setTypeFilters] = React.useState({
    [Death.DEATH.value]: !!query.type?.includes(Death.DEATH.value),
    [Uncategorized.UNCATEGORIZED.value]: !!query.type?.includes(
      Uncategorized.UNCATEGORIZED.value
    ),
    [ScientificStudy.SCIENTIFIC_STUDY.value]: !!query.type?.includes(
      ScientificStudy.SCIENTIFIC_STUDY.value
    ),
    [Patent.PATENT.value]: !!query.type?.includes(Patent.PATENT.value),
    [Documentary.DOCUMENTARY.value]: !!query.type?.includes(
      Documentary.DOCUMENTARY.value
    ),
    [Transaction.TRANSACTION.value]: !!query.type?.includes(
      Transaction.TRANSACTION.value
    ),
  });

  const [isExpanded, setIsExpanded] = React.useState(false);

  const handleSearchChange = (options: SearchOption[]): void => {
    const queryUpdate = serializeOption(options);

    onQueryChange({
      ...query,
      ...queryUpdate,
      tab,
      groups: (query.groups ?? []).concat(queryUpdate.groups.map((g) => g.id)),
      actors: (query.actors ?? []).concat(queryUpdate.actors.map((g) => g.id)),
      keywords: (query.keywords ?? []).concat(
        queryUpdate.keywords.map((g) => g.id)
      ),
    });
  };

  const handleTypeChange = React.useCallback(
    (filterK: keyof typeof filters) => {
      const allEnabled = pipe(
        filters,
        R.reduce(S.Ord)(true, (acc, b) => acc && b)
      );

      const ff = allEnabled
        ? {
            [Documentary.DOCUMENTARY.value]: false,
            [Patent.PATENT.value]: false,
            [Transaction.TRANSACTION.value]: false,
            [Uncategorized.UNCATEGORIZED.value]: false,
            [Death.DEATH.value]: false,
            [ScientificStudy.SCIENTIFIC_STUDY.value]: false,
            [filterK]: true,
          }
        : {
            ...filters,
            [filterK]: !filters[filterK],
          };

      setTypeFilters({
        ...ff,
      });

      const type = [
        [ff.uncategorized, UNCATEGORIZED.value],
        [ff.deaths, DEATH.value],
        [ff.documentaries, DOCUMENTARY.value],
        [ff.patents, PATENT.value],
        [ff.scientificStudies, SCIENTIFIC_STUDY.value],
      ]
        .map(([enabled, key]: any[]) => (enabled ? key : undefined))
        .filter((a) => a !== undefined);

      onQueryChange({
        ...query,
        type,
        tab,
      });
    },
    [query]
  );

  const clearButton =
    actors.length > 0 || groups.length > 0 || keywords.length > 0 ? (
      <IconButton
        style={{
          padding: 0,
        }}
        onClick={() => onQueryClear()}
        size="large"
      >
        <HighlightOffIcon />
      </IconButton>
    ) : null;

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
        const totalEvents = getTotal(totals, {
          transactions: filters.Transaction,
          documentaries: filters.Documentary,
          uncategorized: filters.Uncategorized,
          patents: filters.Patent,
          scientificStudies: filters.ScientificStudy,
          deaths: filters.Death,
        });

        const actorsList = (
          <ActorList
            style={{
              display: "flex",
              flexDirection: "row",
            }}
            actors={actors.map((a) => ({ ...a, selected: true }))}
            onActorClick={(gms) => {
              if (isExpanded) {
                onQueryChange({
                  ...query,
                  tab,
                  actors: query.actors?.filter((g) => g !== gms.id),
                });
              }
            }}
          />
        );

        const groupsList = (
          <GroupList
            style={{
              display: "flex",
              flexDirection: "row",
            }}
            groups={groups.map((g) => ({ ...g, selected: true }))}
            onItemClick={(g) => {
              if (isExpanded) {
                onQueryChange({
                  ...query,
                  tab,
                  groups: query.groups?.filter((gg) => gg !== g.id),
                });
              }
            }}
          />
        );

        const keywordList = (
          <KeywordList
            style={{
              display: "flex",
              flexDirection: "row",
            }}
            keywords={keywords.map((k) => ({ ...k, selected: true }))}
            onItemClick={(k) => {
              if (isExpanded) {
                onQueryChange({
                  ...query,
                  tab,
                  keywords: query.keywords?.filter((kk) => kk !== k.id),
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
                  tab,
                  groupsMembers: query.groupsMembers?.filter(
                    (g) => gm.id !== g
                  ),
                });
              }
            }}
          />
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
              query={{ ...query, tab }}
              onQueryChange={handleSearchChange}
            />
          </div>
        );

        const dateRangeBox =
          query.startDate ?? query.endDate ? (
            <Box style={{ display: "flex", alignItems: "center" }}>
              {query.startDate ? (
                <Typography variant="subtitle1" style={{ marginRight: 10 }}>
                  From <b>{query.startDate}</b>
                </Typography>
              ) : null}
              {query.endDate ? (
                <Typography variant="subtitle1" style={{ marginRight: 10 }}>
                  To <b>{query.endDate}</b>
                </Typography>
              ) : null}
            </Box>
          ) : null;

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
                    tab,
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

        const eventTotal = (
          <Box
            style={{
              display: "flex",
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
                padding: theme.spacing(0, 1),
              }}
              onClick={(e) => {
                e.stopPropagation();
                onQueryChange({
                  ...query,
                  tab,
                  _order: query._order === "DESC" ? "ASC" : "DESC",
                });
              }}
              size="large"
            >
              {query._order === "DESC" ? <ArrowUpIcon /> : <ArrowDownIcon />}
            </IconButton>
          </Box>
        );

        const summary = (
          <Box
            style={{
              display: "flex",
              width: "100%",
            }}
          >
            {dateRangeBox}
            <EventTypeFilters
              filters={filters}
              totals={totals}
              onChange={handleTypeChange}
            />
            {!isExpanded ? searchTermBox : null}
            {actors.length > 0 || groups.length > 0 || keywords.length > 0 ? (
              <Box
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  width: "100%",
                }}
              >
                {keywordList}
                {actorsList}
                {groupsList}
                {groupsMembersList}
                <Box
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    marginRight: theme.spacing(2),
                  }}
                >
                  {clearButton}
                </Box>
              </Box>
            ) : null}
            {eventTotal}
          </Box>
        );

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
          <Box display="flex" style={{ width: "100%" }}>
            <Grid container>
              <Grid item md={8} sm={6} xs={12}>
                {searchBox}
              </Grid>
              <Grid item md={2} sm={3} xs={6}>
                <DatePicker
                  className={classes.dateInput}
                  size="small"
                  value={currentDateRange[0]}
                  variant="standard"
                  datatype="date"
                  InputLabelProps={{
                    disabled: true,
                  }}
                  onChange={(e) => {
                    setCurrentDateRange([
                      e.target.value === "" ? undefined : e.target.value,
                      currentDateRange[1],
                    ]);
                  }}
                  onBlur={(e) => {
                    onQueryChange({
                      ...query,
                      tab,
                      startDate:
                        e.target.value === "" ? undefined : e.target.value,
                      endDate: currentDateRange[1],
                    });
                  }}
                  style={{ width: "100%" }}
                />
              </Grid>
              <Grid item md={2} sm={3} xs={6}>
                <DatePicker
                  className={classes.dateInput}
                  size="small"
                  value={currentDateRange[1]}
                  variant="standard"
                  InputLabelProps={{
                    disabled: true,
                  }}
                  onChange={(e) => {
                    setCurrentDateRange([
                      currentDateRange[0],
                      e.target.value === "" ? undefined : e.target.value,
                    ]);
                  }}
                  onBlur={(e) =>
                    onQueryChange({
                      ...query,
                      tab,
                      startDate: currentDateRange[1],
                      endDate:
                        e.target.value === "" ? undefined : e.target.value,
                    })
                  }
                  style={{ width: "100%" }}
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
                <Box
                  style={{
                    display: "flex",
                    width: "100%",
                    alignItems: "center",
                    justifyItems: "center",
                    flexDirection: "column",
                  }}
                >
                  {summary}
                </Box>
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
