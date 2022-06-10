import {
  Death,
  Documentary,
  Patent,
  ScientificStudy,
  Uncategorized,
} from "@liexp/shared/io/http/Events";
import { EventTotals } from "@liexp/shared/io/http/Events/SearchEventsQuery";
import * as React from "react";
import {
  AutoSizer,
  CellMeasurer,
  CellMeasurerCache,
  Index,
  IndexRange,
  InfiniteLoader,
  List,
  ListRowProps,
} from "react-virtualized";
import {
  SearchEventQueryInput,
  searchEventsInfiniteQuery,
} from "../../../state/queries/SearchEventsQuery";
import { styled } from "../../../theme";
import { FullSizeLoader } from "../../Common/FullSizeLoader";
import { Box } from "../../mui";
import { EventListItemProps } from "./EventListItem";
import EventTimelineItem, { EventTimelineItemProps } from "./EventTimelineItem";

const PREFIX = "EventsTimeline";

const classes = {
  timeline: `${PREFIX}-timeline`,
  listSubheader: `${PREFIX}-listSubheader`,
  listItemUList: `${PREFIX}-listItemUList`,
};

const StyledBox = styled(Box)(({ theme }) => ({
  [`& .${classes.timeline}`]: {
    padding: 0,
    paddingTop: 20,
    width: "100%",
  },

  [`& .${classes.listSubheader}`]: {
    backgroundColor: theme.palette.common.white,
  },

  [`& .${classes.listItemUList}`]: {
    padding: 0,
    width: "100%",
  },
}));

const cellCache = new CellMeasurerCache({
  fixedWidth: true,
  minWidth: 200,
});

const Row: React.FC<
  ListRowProps &
    Omit<EventTimelineItemProps, "onLoad" | "onRowInvalidate"> & { k: string }
> = (props) => {
  const {
    event,
    onClick,
    onKeywordClick,
    onActorClick,
    onGroupClick,
    onGroupMemberClick,
    // isVisible,
    isLast,
    style,
    parent,
    index,
    k: key,
  } = props;

  // if (!isVisible) {
  //   return (
  //     <div
  //       style={{
  //         display: "flex",
  //         alignItems: "center",
  //         justifyContent: "center",
  //         height: 100,
  //         width: "100%",
  //         ...props.style,
  //       }}
  //     />
  //   );
  // }

  return (
    <CellMeasurer
      key={key}
      cache={cellCache}
      columnIndex={0}
      rowIndex={index}
      parent={parent}
    >
      {({ registerChild, measure }) => {
        if (!event) {
          return (
            <div
              ref={registerChild as any}
              key={key}
              style={{ height: 100 }}
              onLoad={measure}
            />
          );
        }

        return (
          <EventTimelineItem
            ref={registerChild}
            isLast={isLast}
            event={event}
            style={style}
            onClick={onClick}
            onKeywordClick={onKeywordClick}
            onActorClick={onActorClick}
            onGroupClick={onGroupClick}
            onGroupMemberClick={onGroupMemberClick}
            onRowInvalidate={() => {
              cellCache.clear(index, 0);
              setTimeout(() => {
                measure();
              }, 300);
            }}
            onLoad={measure}
          />
        );
      }}
    </CellMeasurer>
  );
};

export interface EventsTimelineProps
  extends Omit<EventListItemProps, "event" | "onRowInvalidate"> {
  className?: string;
  hash: string;
  queryParams: Omit<SearchEventQueryInput, "hash" | "_start" | "_end">;
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

  // const theme = useTheme();

  // const isDownSM = useMediaQuery(theme.breakpoints.down("sm"));

  const itemProps = {
    onClick,
    onActorClick,
    onGroupClick,
    onGroupMemberClick,
    onKeywordClick,
  };

  const {
    data,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    isRefetching,
    refetch,
  } = searchEventsInfiniteQuery(queryParams);

  const searchEvents =
    data?.pages !== undefined
      ? data.pages.reduce(
          (acc, p) => ({
            events: acc.events.concat(p.events),
            actors: acc.actors.concat(p.actors),
            groups: acc.groups.concat(p.groups),
            groupsMembers: acc.groupsMembers.concat(p.groupsMembers),
            total: p.total,
            totals: p.totals,
          }),

          {
            events: [] as any[],
            actors: [] as any[],
            groups: [] as any[],
            groupsMembers: [] as any[],
            total: 0,
            totals: {} as any as EventTotals,
          }
        )
      : undefined;

  const totalEvents = React.useMemo(
    () =>
      [
        queryParams.type?.includes(Death.DEATH.value)
          ? searchEvents?.totals.deaths ?? 0
          : 0,
        queryParams.type?.includes(Uncategorized.UNCATEGORIZED.value)
          ? searchEvents?.totals.uncategorized ?? 0
          : 0,
        queryParams.type?.includes(ScientificStudy.SCIENTIFIC_STUDY.value)
          ? searchEvents?.totals.scientificStudies ?? 0
          : 0,
        queryParams.type?.includes(Patent.PATENT.value)
          ? searchEvents?.totals.patents ?? 0
          : 0,
        queryParams.type?.includes(Documentary.DOCUMENTARY.value)
          ? searchEvents?.totals.documentaries ?? 0
          : 0,
      ].reduce((acc, tot) => acc + tot, 0),
    [searchEvents?.totals ?? {}]
  );

  const isRowLoaded = (params: Index): boolean => {
    const rowLoaded = searchEvents?.events[params.index] !== undefined;
    return rowLoaded;
  };

  const handleLoadMoreRows = async (params: IndexRange): Promise<void> => {
    if (hasNextPage && !isFetchingNextPage && !isFetching) {
      const cacheSize = searchEvents?.events.length ?? 0;
      if (params.startIndex >= cacheSize || params.stopIndex > cacheSize) {
        await fetchNextPage({ pageParam: params });
      }
    }
    return await Promise.resolve(undefined);
  };

  React.useEffect(() => {
    // _loadedRowsMap = {};
    // _linksOpenInRowMap = {};
    void refetch({ refetchPage: () => true });
  }, [hash]);

  if (isRefetching || !searchEvents) {
    return <FullSizeLoader />;
  }

  return (
    <StyledBox
      display={"flex"}
      style={{
        flexGrow: 1,
        flexShrink: 0,
        flexBasis: "auto",
        height: "100%",
        minHeight: 600,
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
                  estimatedRowSize={totalEvents}
                  overscanRowCount={5}
                  onRowsRendered={onRowsRendered}
                  rowRenderer={({ key, ...props }) => {
                    const event = searchEvents?.events[props.index];
                    const isLast =
                      searchEvents?.events[props.index + 1] === undefined;

                    return (
                      <Row
                        {...itemProps}
                        {...props}
                        key={key}
                        k={key}
                        event={event}
                        isLast={isLast}
                      />
                    );
                  }}
                  rowCount={searchEvents.events.length}
                  rowHeight={cellCache.rowHeight}
                  deferredMeasurementCache={cellCache}
                />
              );
            }}
          </AutoSizer>
        )}
      </InfiniteLoader>
    </StyledBox>
  );
};

export default EventsTimeline;
