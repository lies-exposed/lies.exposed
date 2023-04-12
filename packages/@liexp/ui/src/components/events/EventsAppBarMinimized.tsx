import { type GroupMember } from "@liexp/shared/lib/io/http";
import {
  Death,
  Documentary,
  Patent,
  Quote,
  ScientificStudy,
  Transaction,
  Uncategorized,
  type EventType,
} from "@liexp/shared/lib/io/http/Events";
import { DEATH } from "@liexp/shared/lib/io/http/Events/Death";
import { DOCUMENTARY } from "@liexp/shared/lib/io/http/Events/Documentary";
import { PATENT } from "@liexp/shared/lib/io/http/Events/Patent";
import { QUOTE } from "@liexp/shared/lib/io/http/Events/Quote";
import { SCIENTIFIC_STUDY } from "@liexp/shared/lib/io/http/Events/ScientificStudy";
import { type EventTotals } from "@liexp/shared/lib/io/http/Events/SearchEventsQuery";
import { TRANSACTION } from "@liexp/shared/lib/io/http/Events/Transaction";
import { UNCATEGORIZED } from "@liexp/shared/lib/io/http/Events/Uncategorized";
import { clsx } from "clsx";
import * as React from "react";
import { type SearchEventsQueryInputNoPagination } from "../../state/queries/SearchEventsQuery";
import { styled } from "../../theme";
import { type ActorItem, ExpandableActorList } from "../lists/ActorList";
import { ExpandableGroupList, type GroupItem } from "../lists/GroupList";
import { GroupsMembersList } from "../lists/GroupMemberList";
import { ExpandableKeywordList, type KeywordItem } from "../lists/KeywordList";
import { Box, Grid, Typography } from "../mui";
import {
  EventTypeFilters,
  type EventTypeFiltersProps,
  type EventTypeMap,
} from "./EventTypeFilters";

const PREFIX = "events-app-bar-minimized";
const classes = {
  root: `${PREFIX}-root`,
  dateRangeBox: `${PREFIX}-date-range-box`,
};

const StyledGrid = styled(Grid)(({ theme }) => ({
  [`&.${classes.root}`]: {
    display: "flex",
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    flexWrap: "wrap",
    [theme.breakpoints.down("sm")]: {
      flexDirection: "row",
    },
  },
  [`& .${classes.dateRangeBox}`]: {
    display: "flex",
    alignItems: "center",
    flexShrink: 0,
    [theme.breakpoints.down("md")]: {
      flexDirection: "column",
    },
  },
}));

export const searchEventQueryToEventTypeFilters = (
  query: SearchEventsQueryInputNoPagination
): Required<EventTypeFiltersProps["filters"]> => {
  return {
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
    [Quote.QUOTE.value]: !!query.type?.includes(Quote.QUOTE.value),
  };
};

export interface EventsAppBarMinimizedProps {
  className?: string;
  query: SearchEventsQueryInputNoPagination;
  current?: number;
  filters: EventTypeFiltersProps["filters"];
  totals: EventTotals;
  actors: ActorItem[];
  groups: GroupItem[];
  keywords: KeywordItem[];
  groupsMembers: GroupMember.GroupMember[];
  onQueryChange: (e: SearchEventsQueryInputNoPagination) => void;
  open: boolean;
  layout?: Partial<{
    eventTypes: number;
    dateRangeBox: { columns: number; variant: "slider" | "picker" };
    relations: number;
  }>;
}

export const EventsAppBarMinimized: React.FC<EventsAppBarMinimizedProps> = ({
  className,
  open: isExpanded,
  query,
  filters,
  actors,
  groups,
  keywords,
  groupsMembers,
  onQueryChange,
  totals,
  layout: _layout,
}) => {
  const layout: Required<EventsAppBarMinimizedProps["layout"]> = {
    eventTypes: 6,
    dateRangeBox: {
      columns: 6,
      variant: "slider",
      ..._layout?.dateRangeBox,
    },
    relations: 4,
    ..._layout,
  };

  const handleFilterChange = React.useCallback(
    (ff: EventTypeMap, filterK: EventType) => {
      const type = [
        [ff.Uncategorized, UNCATEGORIZED.value],
        [ff.Death, DEATH.value],
        [ff.Documentary, DOCUMENTARY.value],
        [ff.Patent, PATENT.value],
        [ff.ScientificStudy, SCIENTIFIC_STUDY.value],
        [ff.Transaction, TRANSACTION.value],
        [ff.Quote, QUOTE.value],
      ]
        .map(([enabled, key]: any[]) => (enabled ? key : undefined))
        .filter((a) => a !== undefined);

      onQueryChange({
        ...query,
        type,
      });
    },
    [query]
  );

  const handleQueryChange = (q: any): void => {
    onQueryChange({
      ...query,
      actors: actors.filter((a) => a.selected).map((a) => a.id),
      groups: groups.filter((g) => g.selected).map((a) => a.id),
      keywords: keywords.filter((k) => k.selected).map((a) => a.id),
      ...q,
    });
  };

  const dateRangeBox =
    query.startDate ?? query.endDate ? (
      <Box className={classes.dateRangeBox}>
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
            .filter((s) => s.selected)
            .map((a) => a.id),
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
              .filter((s) => s.selected)
              .map((a) => a.id),
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
              .filter((s) => s.selected)
              .map((a) => a.id),
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

  return (
    <StyledGrid className={clsx(classes.root, className)}>
      <Grid
        item
        sm={12}
        md={layout.eventTypes}
        style={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
        }}
      >
        <EventTypeFilters
          filters={filters}
          totals={totals}
          onChange={handleFilterChange}
        />
      </Grid>

      {dateRangeBox ? (
        <Grid
          item
          sm={12}
          md={layout.dateRangeBox.columns}
          style={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
          }}
        >
          {dateRangeBox}
        </Grid>
      ) : null}

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
    </StyledGrid>
  );
};
