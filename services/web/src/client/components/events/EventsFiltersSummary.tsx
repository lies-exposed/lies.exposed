import { ActorList } from "@liexp/ui/components/lists/ActorList";
import GroupList from "@liexp/ui/components/lists/GroupList";
import { GroupsMembersList } from "@liexp/ui/components/lists/GroupMemberList";
import KeywordList from "@liexp/ui/components/lists/KeywordList";
import { SearchEventQueryResult } from "@liexp/ui/state/queries/SearchEventsQuery";
import { Grid, makeStyles, Typography } from "@material-ui/core";
import Box from "@material-ui/core/Box";
import * as React from "react";
import { EventsView } from "../../utils/location.utils";

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
}));

export interface EventsFilterSummaryProps
  extends Omit<SearchEventQueryResult, "events"> {
  className: string;
  queryFilters: Required<Omit<EventsView, "view" | "page">>;
  onQueryChange: (f: EventsFilterSummaryProps["queryFilters"]) => void;
}

const EventsFilterSummary: React.FC<EventsFilterSummaryProps> = (props) => {
  const {
    children,
    actors,
    groups,
    keywords,
    groupsMembers,
    queryFilters: { startDate, endDate, ...query },
    onQueryChange,
  } = props;

  const classes = useStyles();
  return (
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
                  keywords: query.keywords.filter((k) => k !== keyword.id),
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
                  actors: query.actors.filter((aId) => aId !== actor.id),
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
                  groups: query.groups.filter((aId) => aId !== group.id),
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
                  groupsMembers: query.groupsMembers.filter((aId) => aId !== gm.id),
                });
              }}
            />
          </Box>
        ) : null}
      </Grid>
      <Grid item sm={12}>
        {children}
      </Grid>
    </Grid>
  );
};

export default EventsFilterSummary;
