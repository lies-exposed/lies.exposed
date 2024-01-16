import * as React from "react";
import {
  type SearchEventQueryResult,
  type SearchEventQueryInput,
} from "../../../state/queries/SearchEventsQuery.js";
import { styled } from "../../../theme/index.js";
import { ActorList } from "../../lists/ActorList.js";
import GroupList from "../../lists/GroupList.js";
import { GroupsMembersList } from "../../lists/GroupMemberList.js";
import KeywordList from "../../lists/KeywordList.js";
import { Grid, Typography, Box } from "../../mui/index.js";

const PREFIX = "EventsFilterSummary";

const classes = {
  filterBox: `${PREFIX}-filterBox`,
  filterLabel: `${PREFIX}-filterLabel`,
  filterValue: `${PREFIX}-filterValue`,
  offset: `${PREFIX}-offset`,
};

const StyledGrid = styled(Grid)(({ theme }) => ({
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
}));

export interface EventsFilterSummaryProps
  extends Omit<SearchEventQueryResult, "events" | "total"> {
  className: string;
  queryFilters: SearchEventQueryInput;
  onQueryChange: (f: SearchEventQueryInput) => void;
}

const EventsFilterSummary: React.FC<
  React.PropsWithChildren<EventsFilterSummaryProps>
> = (props) => {
  const {
    children,
    actors,
    groups,
    keywords,
    groupsMembers,
    queryFilters: { startDate, endDate, ...query },
    onQueryChange,
  } = props;

  return (
    <StyledGrid
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
        sm={12}
        style={{
          display: "flex",
          flexDirection: "row",
        }}
      >
        <Box className={classes.filterBox}>
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
            -
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
            <KeywordList
              style={{ display: "flex", flexDirection: "row" }}
              keywords={keywords.map((a) => ({ ...a, selected: true }))}
              onItemClick={(keyword) => {
                onQueryChange({
                  ...query,
                  startDate,
                  endDate,
                  keywords: query.keywords?.filter((k) => k !== keyword.id),
                });
              }}
            />
          </Box>
        ) : null}
        {actors.length > 0 ? (
          <Box className={classes.filterBox}>
            <ActorList
              actors={actors.map((a) => ({ ...a, selected: true }))}
              onActorClick={(actor) => {
                onQueryChange({
                  ...query,
                  startDate,
                  endDate,
                  actors: query.actors?.filter((aId) => aId !== actor.id),
                });
              }}
            />
          </Box>
        ) : null}
        {groups.length > 0 ? (
          <Box className={classes.filterBox}>
            <GroupList
              groups={groups.map((g) => ({ ...g, selected: true }))}
              onItemClick={(group) => {
                onQueryChange({
                  ...query,
                  startDate,
                  endDate,
                  groups: query.groups?.filter((aId) => aId !== group.id),
                });
              }}
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
              onItemClick={(gm) => {
                onQueryChange({
                  ...query,
                  startDate,
                  endDate,
                  groupsMembers: query.groupsMembers?.filter(
                    (aId) => aId !== gm.id,
                  ),
                });
              }}
            />
          </Box>
        ) : null}
      </Grid>
      <Grid item sm={12}>
        {children}
      </Grid>
    </StyledGrid>
  );
};

export default EventsFilterSummary;
