import { getTotal } from "@liexp/shared/helpers/event";
import {
  type Actor,
  type Group,
  type GroupMember,
  type Keyword,
} from "@liexp/shared/io/http";
import {
  Death,
  Documentary,
  type EventType,
  Patent,
  Quote,
  ScientificStudy,
  Transaction,
  Uncategorized,
} from "@liexp/shared/io/http/Events";
import { DEATH } from "@liexp/shared/io/http/Events/Death";
import { DOCUMENTARY } from "@liexp/shared/io/http/Events/Documentary";
import { PATENT } from "@liexp/shared/io/http/Events/Patent";
import { QUOTE } from "@liexp/shared/io/http/Events/Quote";
import { SCIENTIFIC_STUDY } from "@liexp/shared/io/http/Events/ScientificStudy";
import { type EventTotals } from "@liexp/shared/io/http/Events/SearchEventsQuery";
import { TRANSACTION } from "@liexp/shared/io/http/Events/Transaction";
import { UNCATEGORIZED } from "@liexp/shared/io/http/Events/Uncategorized";
import ArrowDownIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpIcon from "@mui/icons-material/ArrowUpward";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import {clsx} from "clsx";
import * as R from "fp-ts/Record";
import { pipe } from "fp-ts/function";
import * as S from "fp-ts/string";
import * as React from "react";
import { type SearchEventsQueryInputNoPagination } from "../../state/queries/SearchEventsQuery";
import { styled } from "../../theme";
import { ActorList } from "../lists/ActorList";
import GroupList from "../lists/GroupList";
import { GroupsMembersList } from "../lists/GroupMemberList";
import KeywordList from "../lists/KeywordList";
import { Box, IconButton, Typography } from "../mui";
import { EventTypeFilters } from "./EventTypeFilters";

const PREFIX = "events-app-bar-minimized";
const classes = {
  root: `${PREFIX}-root`,
  dateRangeBox: `${PREFIX}-date-range-box`,
};

const StyledBox = styled(Box)(({ theme }) => ({
  [`&.${classes.root}`]: {
    display: "flex",
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    [theme.breakpoints.down("sm")]: {
      flexDirection: "column",
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

interface EventsAppBarMinimizedProps {
  className?: string;
  query: SearchEventsQueryInputNoPagination;
  tab: number;
  current?: number;
  totals: EventTotals;
  actors: Actor.Actor[];
  groups: Group.Group[];
  keywords: Keyword.Keyword[];
  groupsMembers: GroupMember.GroupMember[];
  onQueryChange: (e: SearchEventsQueryInputNoPagination, tab: number) => void;
  onQueryClear: () => void;
  open: boolean;
}

export const EventsAppBarMinimized: React.FC<EventsAppBarMinimizedProps> = ({
  className,
  open: isExpanded,
  query,
  tab,
  actors,
  groups,
  keywords,
  groupsMembers,
  onQueryChange,
  onQueryClear,
  totals,
  current,
}) => {
  const filters = React.useMemo(() => {
    if (!query.type) {
      return {
        [Death.DEATH.value]: true,
        [Uncategorized.UNCATEGORIZED.value]: true,
        [ScientificStudy.SCIENTIFIC_STUDY.value]: true,
        [Patent.PATENT.value]: true,
        [Documentary.DOCUMENTARY.value]: true,
        [Transaction.TRANSACTION.value]: true,
        [Quote.QUOTE.value]: true,
      };
    }
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
  }, [query.type]);

  const totalEvents = getTotal(totals, {
    transactions: filters.Transaction,
    documentaries: filters.Documentary,
    uncategorized: filters.Uncategorized,
    patents: filters.Patent,
    scientificStudies: filters.ScientificStudy,
    deaths: filters.Death,
    quotes: filters.Quote,
  });

  const handleFilterChange = React.useCallback(
    (filterK: EventType) => {
      const allEnabled = pipe(
        filters,
        R.reduce(S.Ord)(true, (acc, b) => acc && b)
      );

      const allDisabled = pipe(
        filters,
        R.reduce(S.Ord)(true, (acc, b) => acc && !b)
      );

      const ff = allEnabled
        ? {
            [Documentary.DOCUMENTARY.value]: false,
            [Patent.PATENT.value]: false,
            [Transaction.TRANSACTION.value]: false,
            [Uncategorized.UNCATEGORIZED.value]: false,
            [Death.DEATH.value]: false,
            [ScientificStudy.SCIENTIFIC_STUDY.value]: false,
            [Quote.QUOTE.value]: false,
            [filterK]: true,
          }
        : allDisabled
        ? {
            [Documentary.DOCUMENTARY.value]: true,
            [Patent.PATENT.value]: true,
            [Transaction.TRANSACTION.value]: true,
            [Uncategorized.UNCATEGORIZED.value]: true,
            [Death.DEATH.value]: true,
            [ScientificStudy.SCIENTIFIC_STUDY.value]: true,
            [Quote.QUOTE.value]: true,
          }
        : {
            ...filters,
            [filterK]: !filters[filterK],
          };

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

      onQueryChange(
        {
          ...query,
          type,
        },
        tab
      );
    },
    [query]
  );

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
        {current ? `${current}/${totalEvents}` : totalEvents}
      </Typography>
      <IconButton
        style={{
          padding: 20,
        }}
        onClick={(e) => {
          e.stopPropagation();
          onQueryChange(
            {
              ...query,
              _order: query._order === "DESC" ? "ASC" : "DESC",
            },
            tab
          );
        }}
        size="large"
      >
        {query._order === "DESC" ? <ArrowUpIcon /> : <ArrowDownIcon />}
      </IconButton>
    </Box>
  );

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
    <ActorList
      style={{
        display: "flex",
        flexDirection: "row",
      }}
      actors={actors.map((a) => ({ ...a, selected: true }))}
      onActorClick={(gms) => {
        onQueryChange(
          {
            actors: query.actors?.filter((g) => g !== gms.id),
            ...query,
          },
          tab
        );
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
          onQueryChange(
            {
              ...query,
              groups: query.groups?.filter((gg) => gg !== g.id),
            },
            tab
          );
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
          onQueryChange(
            {
              ...query,

              keywords: query.keywords?.filter((kk) => kk !== k.id),
            },
            tab
          );
        }
      }}
    />
  );

  const groupsMembersList = (
    <GroupsMembersList
      groupsMembers={groupsMembers.map((g) => ({ ...g, selected: true }))}
      onItemClick={(gm) => {
        if (isExpanded) {
          onQueryChange(
            {
              ...query,
              groupsMembers: query.groupsMembers?.filter((g) => gm.id !== g),
            },
            tab
          );
        }
      }}
    />
  );

  return (
    <StyledBox className={clsx(classes.root, className)}>
      {dateRangeBox}
      <EventTypeFilters
        filters={filters}
        totals={totals}
        onChange={handleFilterChange}
      />
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
              marginRight: 20,
            }}
          >
            {clearButton}
          </Box>
        </Box>
      ) : null}
      {eventTotal}
    </StyledBox>
  );
};
