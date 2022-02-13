// import { groupBy } from "@econnessione/shared/utils/array.utils";
// import { distanceFromNow } from "@econnessione/shared/utils/date";
import { makeStyles } from "@material-ui/core";
// import * as Eq from "fp-ts/lib/Eq";
// import { pipe } from "fp-ts/lib/function";
// import * as S from "fp-ts/lib/string";
import * as React from "react";
import {
  AutoSizer,
  Index,
  IndexRange,
  InfiniteLoader,
  List,
  ListRowProps,
} from "react-virtualized";
import "react-virtualized/styles.css";
import {
  SearchEventQueryInput,
  SearchEventQueryResult,
  searchEventsQuery,
} from "../../../state/queries/SearchEventsQuery";
import { EventListItemProps, getItemHeight } from "./EventListItem";
import EventTimelineItem, { EventTimelineItemProps } from "./EventTimelineItem";

// const byEqualDate = pipe(
//   S.Eq,
//   Eq.contramap((e: SearchEvent): string => {
//     return distanceFromNow(e.date);
//   })
// );

const useStyles = makeStyles((props) => ({
  timeline: {
    padding: 0,
    width: "100%",
  },
  listSubheader: {
    backgroundColor: props.palette.common.white,
  },
  listItemUList: {
    padding: 0,
    width: "100%",
  },
}));

const Row: React.FC<ListRowProps & EventTimelineItemProps> = (props) => {
  const { index, event, ...listItemProps } = props;
  if (!event) {
    return <div />;
  }
  return <EventTimelineItem {...listItemProps} key={event.id} event={event} />;
};
export interface EventsTimelineProps extends Omit<EventListItemProps, "event"> {
  className?: string;
  style?: React.CSSProperties;
  hash: string;
  queryParams: Omit<SearchEventQueryInput, "hash" | "_start" | "_end">;
  filters: {
    uncategorized: boolean;
    deaths: boolean;
    scientificStudies: boolean;
  };
}

const EventsTimeline: React.FC<EventsTimelineProps> = (props) => {
  const {
    hash,
    queryParams,
    onClick,
    onActorClick,
    onGroupClick,
    onKeywordClick,
    onGroupMemberClick,
    ...listProps
  } = props;
  // const orderedEvents = React.useMemo(
  //   () => pipe(events, groupBy(byEqualDate)),
  //   [events]
  // );

  const classes = useStyles();
  const [searchEvents, setSearchEvents] =
    React.useState<SearchEventQueryResult>({
      events: [],
      actors: [],
      groups: [],
      groupsMembers: [],
      keywords: [],
      totals: {
        uncategorized: 0,
        scientificStudies: 0,
        patents: 0,
        deaths: 0,
      },
    });

  const itemProps = {
    classes,
    onClick,
    onActorClick,
    onGroupClick,
    onGroupMemberClick,
    onKeywordClick,
  };

  const handleLoadMoreRows = async (params: IndexRange): Promise<void> => {
    if (
      params.startIndex < searchEvents.events.length &&
      params.stopIndex < searchEvents.events.length
    ) {
      return await Promise.resolve(undefined);
    }

    return await searchEventsQuery
      .run({
        ...queryParams,
        hash,
        _start: params.startIndex as any,
        _end: params.stopIndex as any,
      })()
      .then((result) => {
        if (result._tag === "Right") {
          setSearchEvents(result.right);
        }

        return new Promise((resolve) => {
          setTimeout(resolve, 100);
        });
      });
  };

  const isRowLoaded = (params: Index): boolean => {
    return params.index <= searchEvents.events.length;
  };

  React.useEffect(() => {
    void searchEventsQuery
      .run({ ...queryParams, hash, _start: 0 as any, _end: 20 as any })()
      .then((result) => {
        if (result._tag === "Right") {
          setSearchEvents(result.right);
        }
      });
  }, [queryParams]);

  // const allEvents = pipe(
  //   filters.deaths
  //     ? searchEvents.events.filter((e) => e.type === Death.DEATH.value)
  //     : filters.scientificStudies
  //     ? events.filter((e) => ScientificStudy.ScientificStudyType.is(e.type))
  //     : events,
  //   A.sort(eventsSort)
  // );

  const totalEvents =
    searchEvents.totals.uncategorized +
    searchEvents.totals.deaths +
    searchEvents.totals.scientificStudies;

  return (
    <InfiniteLoader
      isRowLoaded={isRowLoaded}
      loadMoreRows={handleLoadMoreRows}
      rowCount={totalEvents}
      minimumBatchSize={20}
    >
      {({ onRowsRendered, registerChild }) => (
        <AutoSizer>
          {({ width, height }) => {
            return (
              <List
                {...listProps}
                ref={registerChild}
                width={width}
                height={height}
                onRowsRendered={onRowsRendered}
                rowRenderer={(props) => {
                  const event = searchEvents.events[props.index];
                  const isLast = props.index === searchEvents.events.length - 1;

                  return (
                    <Row
                      {...itemProps}
                      {...props}
                      event={event}
                      isLast={isLast}
                    />
                  );
                }}
                rowCount={totalEvents}
                rowHeight={({ index }) => {
                  const event = searchEvents.events[index];
                  return event ? getItemHeight(event) : 0;
                }}
              />
            );
          }}
        </AutoSizer>
      )}
    </InfiniteLoader>
  );
};

export default EventsTimeline;
