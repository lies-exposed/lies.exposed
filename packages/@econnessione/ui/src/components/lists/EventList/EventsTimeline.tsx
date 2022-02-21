import { makeStyles, useMediaQuery, useTheme } from "@material-ui/core";
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
  const { index, event, ...listItemProps } = props;
  if (!event) {
    return <FullSizeLoader style={{ height: 100 }} />;
  }
  return (
    <EventTimelineItem {...listItemProps} key={event.id} event={{ ...event }} />
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
  style?: React.CSSProperties;
  hash: string;
  queryParams: Omit<SearchEventQueryInput, "hash" | "_start" | "_end">;
  data: SearchEventQueryResult;
  filters: {
    uncategorized: boolean;
    deaths: boolean;
    scientificStudies: boolean;
  };
  onLoadMoreEvents: (params: IndexRange) => Promise<void>;
}

const EventsTimeline: React.FC<EventsTimelineProps> = (props) => {
  const {
    hash,
    queryParams,
    data: searchEvents,
    filters,
    onLoadMoreEvents,
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

  const theme = useTheme();
  const classes = useStyles();
  const isDownMD = useMediaQuery(theme.breakpoints.down("md"));

  const itemProps = {
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

    void onLoadMoreEvents(params);
  };

  const isRowLoaded = (params: Index): boolean => {
    return params.index <= searchEvents.events.length;
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
                className={classes.timeline}
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
                  return event ? getItemHeight(event, isDownMD) : 150;
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
