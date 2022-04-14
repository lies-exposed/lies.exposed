import { Actor, Group, GroupMember, Keyword } from "@liexp/shared/io/http";
import {
  Death,
  Documentary,
  Patent,
  ScientificStudy,
  Transaction,
  Uncategorized
} from "@liexp/shared/io/http/Events";
import DatePicker from "@liexp/ui/components/Common/DatePicker";
import { EventIcon } from "@liexp/ui/components/Common/Icons";
import QueriesRenderer from "@liexp/ui/components/QueriesRenderer";
import { ActorList } from "@liexp/ui/components/lists/ActorList";
import GroupList from "@liexp/ui/components/lists/GroupList";
import { GroupsMembersList } from "@liexp/ui/components/lists/GroupMemberList";
import KeywordList from "@liexp/ui/components/lists/KeywordList";
import { getTotal } from "@liexp/ui/helpers/event.helper";
import { searchEventsQuery } from "@liexp/ui/state/queries/SearchEventsQuery";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  alpha,
  AppBar, Grid,
  IconButton,
  makeStyles,
  Typography,
  useTheme
} from "@material-ui/core";
import Box from "@material-ui/core/Box";
import ArrowDownIcon from "@material-ui/icons/ArrowDownward";
import ArrowUpIcon from "@material-ui/icons/ArrowUpward";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import HighlightOffIcon from "@material-ui/icons/HighlightOff";
import SearchIcon from "@material-ui/icons/Search";
import clsx from "clsx";
import * as React from "react";
import SearchEventInput, { SearchOption } from "./inputs/SearchEventInput";
import { EventsQueryParams } from "@containers/EventsPanel";

const eventIconProps = {
  size: "sm" as const,
  style: {
    marginRight: 10,
  },
};

const useStyles = makeStyles((theme) => ({
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
    padding: theme.spacing(0, 2, 0, 0),
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
    paddingLeft: theme.spacing(3),
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

const serializeOption = (
  options: SearchOption[]
): {
  groups: Group.Group[];
  actors: Actor.Actor[];
  keywords: Keyword.Keyword[];
} => {
  return options.reduce(
    (acc, o) => {
      return {
        groups: acc.groups.concat(o.type === "Group" ? [o.item] : []),
        actors: acc.actors.concat(o.type === "Actor" ? [o.item] : []),
        keywords: acc.keywords.concat(o.type === "Keyword" ? [o.item] : []),
      };
    },
    {
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
  query,
  hash,
  actors,
  groups,
  groupsMembers,
  keywords,
  onQueryChange,
  onQueryClear,
}) => {
  const theme = useTheme();
  const classes = useStyles();

  const [currentDateRange, setCurrentDateRange] = React.useState([
    query.startDate,
    query.endDate,
  ]);

  const [filters, setTypeFilters] = React.useState({
    deaths: !!query.type?.includes(Death.DEATH.value),
    uncategorized: !!query.type?.includes(Uncategorized.UNCATEGORIZED.value),
    scientificStudies: !!query.type?.includes(
      ScientificStudy.SCIENTIFIC_STUDY.value
    ),
    patents: !!query.type?.includes(Patent.PATENT.value),
    documentaries: !!query.type?.includes(Documentary.DOCUMENTARY.value),
    transactions: !!query.type?.includes(Transaction.TRANSACTION.value),
  });

  const [isExpanded, setIsExpanded] = React.useState(true);

  const handleSearchChange = (options: SearchOption[]): void => {
    const queryUpdate = serializeOption(options);
    onQueryChange({
      ...query,
      groups: (query.groups ?? []).concat(queryUpdate.groups.map((g) => g.id)),
      actors: (query.actors ?? []).concat(queryUpdate.actors.map((g) => g.id)),
      keywords: (query.keywords ?? []).concat(
        queryUpdate.keywords.map((g) => g.id)
      ),
    });
  };

  const toggleBox = (
    <Box style={{ display: "flex", justifyContent: "center" }}>
      <IconButton
        style={{
          padding: 0,
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? (
          <ExpandLessIcon fontSize="small" />
        ) : (
          <ExpandMoreIcon fontSize="small" />
        )}
      </IconButton>
    </Box>
  );

  const clearButton =
    actors.length > 0 || groups.length > 0 || keywords.length > 0 ? (
      <IconButton
        style={{
          padding: 0,
        }}
        onClick={() => onQueryClear()}
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
        const totalEvents = getTotal(totals, filters);

        const actorsList = (
          <ActorList
            style={{
              display: "flex",
              flexDirection: "row",
            }}
            actors={actors.map((a) => ({ ...a, selected: true }))}
            onActorClick={(gms) =>
              onQueryChange({
                ...query,
                actors: query.actors?.filter((g) => g !== gms.id),
              })
            }
          />
        );

        const groupsList = (
          <GroupList
            style={{
              display: "flex",
              flexDirection: "row",
            }}
            groups={groups.map((g) => ({ ...g, selected: true }))}
            onItemClick={(g) =>
              onQueryChange({
                ...query,
                groups: query.groups?.filter((gg) => gg !== g.id),
              })
            }
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
              onQueryChange({
                ...query,
                keywords: query.keywords?.filter((kk) => kk !== k.id),
              });
            }}
          />
        );

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
        );

        const typeFilters = (
          <Box
            style={{
              display: "flex",
              width: "100%",
            }}
          >
            <IconButton
              className={clsx(classes.iconButton, {
                [classes.iconButtonSelected]: filters.uncategorized,
              })}
              color="primary"
              style={{ marginRight: 10 }}
              onClick={() => {
                setTypeFilters({
                  ...filters,
                  uncategorized: !filters.uncategorized,
                });
              }}
            >
              <EventIcon type="Uncategorized" {...eventIconProps} />
              <Typography variant="caption">{totals.uncategorized}</Typography>
            </IconButton>
            <IconButton
              color="primary"
              className={clsx(classes.iconButton, {
                [classes.iconButtonSelected]: filters.deaths,
              })}
              onClick={() => {
                setTypeFilters({
                  ...filters,
                  deaths: !filters.deaths,
                });
              }}
            >
              <EventIcon type="Death" {...eventIconProps} />
              <Typography variant="caption">{totals.deaths}</Typography>
            </IconButton>
            <IconButton
              color="primary"
              className={clsx(classes.iconButton, {
                [classes.iconButtonSelected]: filters.scientificStudies,
              })}
              onClick={() => {
                setTypeFilters({
                  ...filters,
                  scientificStudies: !filters.scientificStudies,
                });
              }}
            >
              <EventIcon type="ScientificStudy" {...eventIconProps} />
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
                setTypeFilters({
                  ...filters,
                  documentaries: !filters.documentaries,
                });
              }}
            >
              <EventIcon
                type={Documentary.DOCUMENTARY.value}
                {...eventIconProps}
              />
              <Typography variant="caption">{totals.documentaries}</Typography>
            </IconButton>
            <IconButton
              color="primary"
              className={clsx(classes.iconButton, {
                [classes.iconButtonSelected]: filters.patents,
              })}
              onClick={() => {
                setTypeFilters({
                  ...filters,
                  patents: !filters.patents,
                });
              }}
            >
              <EventIcon type="Patent" {...eventIconProps} />
              <Typography variant="caption">{totals.patents}</Typography>
            </IconButton>
            <IconButton
              color="primary"
              className={clsx(classes.iconButton, {
                [classes.iconButtonSelected]: filters.transactions,
              })}
              onClick={() => {
                setTypeFilters({
                  ...filters,
                  transactions: !filters.transactions,
                });
              }}
            >
              <EventIcon type="Transaction" {...eventIconProps} />
              <Typography variant="caption">{totals.transactions}</Typography>
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
            {actors.length > 0 || groups.length > 0 || keywords.length > 0 ? (
              <Box
                style={{
                  display: "flex",
                  alignItems: "center",
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
                    flexGrow: 1,
                    justifyContent: "flex-end",
                    marginRight: theme.spacing(2),
                  }}
                >
                  {clearButton}
                </Box>
              </Box>
            ) : null}
            {!isExpanded ? eventTotal : null}
          </Box>
        );

        const expanded = (
          <Box display="flex" style={{ width: "100%" }}>
            <Grid container>
              <Grid item md={6} sm={6} xs={12}>
                {searchBox}
              </Grid>
              <Grid item md={3} sm={3} xs={6}>
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
              <Grid item md={3} sm={3} xs={6}>
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
              <Grid
                item
                md={12}
                sm={12}
                style={{
                  display: "flex",
                  flexDirection: "row",
                  maxWidth: "100%",
                  width: "100%",
                  [theme.breakpoints.down("md")]: {
                    flexDirection: "column",
                  },
                }}
              >
                {typeFilters}
                {eventTotal}
              </Grid>
            </Grid>
          </Box>
        );

        return (
          <AppBar
            position="fixed"
            color="transparent"
            style={{
              background: theme.palette.common.white,
            }}
          >
            <Accordion
              expanded={isExpanded}
              onChange={() => {
                setIsExpanded(!isExpanded);
              }}
            >
              <AccordionSummary>
                <Box
                  style={{
                    display: "flex",
                    width: "100%",
                    marginTop: 60,
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
            {/* <Slide
              mountOnEnter={true}
              appear={false}
              in={!isExpanded}
              direction="down"
            >
              <Box
                style={{
                  display: "flex",
                  width: "100%",
                  minHeight: 60,
                  marginTop: !isExpanded ? 60 : 0,
                  alignItems: "center",
                  justifyItems: "center",
                  flexDirection: "column",
                }}
              >
                {summary}
                {toggleBox}
              </Box>
            </Slide> */}
            {/* <Slide
              mountOnEnter={true}
              appear={false}
              in={isExpanded}
              direction="down"
            >
              <Box width="100%" style={{ margin: 0 }}>
                {expanded}
                {toggleBox}
              </Box>
            </Slide> */}
          </AppBar>
        );
      }}
    />
  );
};
export default EventsAppBar;
