import {
  Death,
  Documentary,
  Patent,
  ScientificStudy,
  SearchEvent,
  Uncategorized,
} from "@liexp/shared/io/http/Events";
import { EventTotals } from "@liexp/shared/io/http/Events/SearchEventsQuery";
import { TRANSACTION } from "@liexp/shared/io/http/Events/Transaction";
import {
  Box,
  CircularProgress,
  makeStyles,
  useMediaQuery,
  useTheme,
} from "@material-ui/core";
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
  searchEventsInfiniteQuery,
} from "../../../state/queries/SearchEventsQuery";
import { isValidValue } from "../../Common/Editor";
import { FullSizeLoader } from "../../Common/FullSizeLoader";
import { EventListItemProps } from "./EventListItem";
import EventTimelineItem, { EventTimelineItemProps } from "./EventTimelineItem";

const useStyles = makeStyles((props) => ({
  timeline: {
    padding: 0,
    paddingTop: 20,
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
    style,
    isVisible,
    onRowInvalidate,
  } = props;

  if (!isVisible) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: 100,
          width: "100%",
          ...props.style,
        }}
      >
        <CircularProgress />
      </div>
    );
  }

  return (
    <EventTimelineItem
      isLast={isLast}
      event={event}
      style={style}
      onClick={onClick}
      onKeywordClick={onKeywordClick}
      onActorClick={onActorClick}
      onGroupClick={onGroupClick}
      onGroupMemberClick={onGroupMemberClick}
      onRowInvalidate={onRowInvalidate}
    />
  );
};

export const getItemHeight = (
  e: SearchEvent.SearchEvent,
  isDownMD: boolean,
  linksOpen: boolean
): number => {
  const excerptHeight = isValidValue(e.excerpt as any) ? 120 : 0;

  const keywordsHeight = e.keywords.length > 0 ? 50 : 0;
  const mediaHeight = e.media.length > 0 ? 450 : 0;
  const linksHeight = e.links.length > 0 ? (linksOpen ? 300 : 50) : 0;
  switch (e.type) {
    case TRANSACTION.value:
      if (isDownMD) {
        return 240 + excerptHeight + keywordsHeight + mediaHeight + linksHeight;
      }

      return 200 + excerptHeight + keywordsHeight + mediaHeight + linksHeight;
    default: {
      if (isDownMD) {
        const scientificStudyHeight =
          e.type === "ScientificStudy" && e.payload.url ? 50 : 0;

        return (
          200 +
          excerptHeight +
          keywordsHeight +
          mediaHeight +
          linksHeight +
          scientificStudyHeight
        );
      }
      return 180 + excerptHeight + keywordsHeight + mediaHeight + linksHeight;
    }
  }
};

export interface EventsTimelineProps extends Omit<EventListItemProps, "event"> {
  className?: string;
  hash: string;
  queryParams: Omit<SearchEventQueryInput, "hash" | "_start" | "_end">;
}

let _linksOpenInRowMap: Record<number, boolean> = {};
let _loadedRowsMap: Record<number, JSX.Element | undefined> = {};

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

  const theme = useTheme();
  const classes = useStyles();
  const isDownSM = useMediaQuery(theme.breakpoints.down("sm"));

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
    const rowLoaded =
      searchEvents?.events[params.index] !== undefined &&
      _loadedRowsMap[params.index] !== undefined;
    return rowLoaded;
  };

  const getRowHeight = ({ index }: Index): number => {
    const event = searchEvents?.events[index];
    const linksOpen = _linksOpenInRowMap[index] ?? false;
    _linksOpenInRowMap[index] = linksOpen;

    return event ? getItemHeight(event, isDownSM, true) : 150;
  };

  const handleLoadMoreRows = async (params: IndexRange): Promise<void> => {
    if (hasNextPage && !isFetchingNextPage && !isFetching) {
      const cacheSize = searchEvents?.events.length ?? 0;
      if (params.startIndex >= cacheSize && params.stopIndex > cacheSize) {
        await fetchNextPage({ pageParam: params });
      }
    }
    return await Promise.resolve(undefined);
  };

  React.useEffect(() => {
    _loadedRowsMap = {};
    _linksOpenInRowMap = {};
    void refetch({ refetchPage: () => true });
  }, [hash]);

  if (isRefetching || !searchEvents) {
    return <FullSizeLoader />;
  }

  return (
    <Box
      display={"flex"}
      style={{
        flexGrow: 1,
        flexShrink: 1,
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
                  estimatedRowSize={100}
                  overscanRowCount={10}
                  onRowsRendered={onRowsRendered}
                  rowRenderer={(props) => {
                    if (props.index >= searchEvents?.events.length) {
                      return <div key={props.key} style={{ height: 100 }} />;
                    }

                    const event = searchEvents?.events[props.index];
                    const isLast =
                      searchEvents?.events[props.index + 1] === undefined;

                    const row = (
                      <Row
                        {...itemProps}
                        {...props}
                        key={event.id}
                        event={event}
                        isLast={isLast}
                        onRowInvalidate={() => {
                          _loadedRowsMap[props.index] = undefined;
                          _linksOpenInRowMap[props.index] = !_linksOpenInRowMap[props.index];

                        }}
                      />
                    );
                    _loadedRowsMap[props.index] = row;
                    return row;
                  }}
                  rowCount={searchEvents.events.length}
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
