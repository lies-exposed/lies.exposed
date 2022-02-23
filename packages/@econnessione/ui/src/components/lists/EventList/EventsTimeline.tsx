import { Box, makeStyles, useMediaQuery, useTheme } from "@material-ui/core";
import * as React from "react";
import {
  AutoSizer,
  Index,
  IndexRange,
  InfiniteLoader,
  List,
  ListRowProps,
} from "react-virtualized";
import {
  SearchEventQueryInput,
  SearchEventQueryResult,
  searchEventsQuery,
} from "../../../state/queries/SearchEventsQuery";
import { isValidValue } from "../../Common/Editor";
import { FullSizeLoader } from "../../Common/FullSizeLoader";
import { EventListItemProps, SearchEvent } from "./EventListItem";
import EventTimelineItem, { EventTimelineItemProps } from "./EventTimelineItem";

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
  const {
    event,
    onClick,
    onKeywordClick,
    onActorClick,
    onGroupClick,
    onGroupMemberClick,
    isLast,
  } = props;
  return (
    <EventTimelineItem
      isLast={isLast}
      key={event.id}
      event={{ ...event }}
      onClick={onClick}
      onKeywordClick={onKeywordClick}
      onActorClick={onActorClick}
      onGroupClick={onGroupClick}
      onGroupMemberClick={onGroupMemberClick}
    />
  );
};

export const getItemHeight = (e: SearchEvent, isDownMD: boolean): number => {
  switch (e.type) {
    default: {
      if (isDownMD) {
        return (
          150 +
          (isValidValue(e.excerpt as any) ? 100 : 0) +
          (e.keywords.length > 0 ? 50 : 0) +
          (e.media.length > 0 ? 400 : 0) +
          (e.links.length > 0 ? 50 : 0)
        );
      }
      return (
        100 +
        (isValidValue(e.excerpt as any) ? 100 : 0) +
        (e.keywords.length > 0 ? 50 : 0) +
        (e.media.length > 0 ? 400 : 0) +
        (e.links.length > 0 ? 50 : 0)
      );
    }
  }
};

export interface EventsTimelineProps extends Omit<EventListItemProps, "event"> {
  className?: string;
  hash: string;
  queryParams: Omit<SearchEventQueryInput, "hash" | "_start" | "_end">;
  // data: SearchEventQueryResult;
  filters: {
    uncategorized: boolean;
    deaths: boolean;
    scientificStudies: boolean;
  };
  // onLoadMoreEvents: (params: IndexRange) => Promise<void>;
}

const initialState: SearchEventQueryResult = {
  events: [],
  actors: [],
  groups: [],
  groupsMembers: [],
  keywords: [],
  totals: { uncategorized: 0, deaths: 0, patents: 0, scientificStudies: 0 },
};


const EventsTimeline: React.FC<EventsTimelineProps> = (props) => {
  const {
    hash,
    queryParams,
    filters,
    onClick,
    onActorClick,
    onGroupClick,
    onKeywordClick,
    onGroupMemberClick,
    ...listProps
  } = props;

  const theme = useTheme();
  const classes = useStyles();
  const isDownMD = useMediaQuery(theme.breakpoints.down("md"));
  const [searchEvents, setSearchEvents] = React.useState(initialState);

  const itemProps = {
    onClick,
    onActorClick,
    onGroupClick,
    onGroupMemberClick,
    onKeywordClick,
  };

  const totalEvents =
    searchEvents.totals.uncategorized +
    searchEvents.totals.deaths +
    searchEvents.totals.scientificStudies;

  const handleLoadMoreRows = async ({
    startIndex,
    stopIndex,
  }: IndexRange): Promise<void> => {
    console.log("load more rows", { startIndex, stopIndex, totalEvents });
    if (startIndex >= totalEvents) {
      await Promise.resolve(undefined);
    }

    void onLoadMoreEvents({ startIndex, stopIndex });
  };

  const isRowLoaded = React.useCallback(
    (params: Index): boolean => {
      const rowLoaded = searchEvents.events[params.index] !== undefined;
      console.log("row loaded", { ...params, rowLoaded });
      return rowLoaded;
    },
    [searchEvents.events.length]
  );

  const getRowHeight = React.useCallback(
    ({ index }: Index) => {
      const event = searchEvents.events[index];

      return event ? getItemHeight(event, isDownMD) : 150;
    },
    [searchEvents.events.length]
  );

  const onLoadMoreEvents = async (range: IndexRange): Promise<void> => {
    // eslint-disable-next-line @typescript-eslint/return-await
    return searchEventsQuery
      .run({
        ...queryParams,
        hash,
        _start: range.startIndex as any,
        _end: range.stopIndex as any,
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

  React.useEffect(() => {
    void onLoadMoreEvents({ startIndex: 0, stopIndex: 20 });
  }, []);

  // const allEvents = pipe(
  //   filters.deaths
  //     ? searchEvents.events.filter((e) => e.type === Death.DEATH.value)
  //     : filters.scientificStudies
  //     ? events.filter((e) => ScientificStudy.ScientificStudyType.is(e.type))
  //     : events,
  //   A.sort(eventsSort)
  // );

  console.log(totalEvents, searchEvents.events);

  return searchEvents.events.length === 0 ? (
    <Box height={150}>
      <FullSizeLoader />
    </Box>
  ) : (
    <Box
      display={"flex"}
      style={{
        flexGrow: 1,
        flexShrink: 1,
        flexBasis: "auto",
      }}
    >
      <InfiniteLoader
        isRowLoaded={isRowLoaded}
        loadMoreRows={handleLoadMoreRows}
        rowCount={totalEvents}
        minimumBatchSize={20}
      >
        {({ onRowsRendered, registerChild }) => (
          <AutoSizer defaultHeight={800}>
            {({ width, height }) => {
              return (
                <List
                  {...listProps}
                  className={classes.timeline}
                  ref={registerChild}
                  width={width}
                  height={height}
                  estimatedRowSize={100}
                  overscanRowCount={5}
                  onRowsRendered={onRowsRendered}
                  rowRenderer={(props) => {
                    if (props.index >= searchEvents.events.length) {
                      return <div style={{ height: 100 }} />;
                    }

                    const event = searchEvents.events[props.index];
                    const isLast = props.index === totalEvents - 1;

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
                  rowHeight={getRowHeight}
                />
              );
            }}
          </AutoSizer>
        )}
      </InfiniteLoader>
    </Box>
  );
};

export default EventsTimeline;
