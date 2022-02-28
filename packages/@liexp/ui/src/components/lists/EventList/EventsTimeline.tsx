import {
  Death,
  Patent,
  ScientificStudy,
  Uncategorized,
} from "@liexp/shared/io/http/Events";
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
  SearchEventQueryResult,
  searchEventsQuery,
} from "../../../state/queries/SearchEventsQuery";
import { isValidValue } from "../../Common/Editor";
import { EventListItemProps, SearchEvent } from "./EventListItem";
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
    key,
  } = props;
  if (!isVisible) {
    return (
      <div
        key={key}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: 100,
          ...props.style,
        }}
      >
        <CircularProgress />
      </div>
    );
  }

  return (
    <EventTimelineItem
      key={key}
      isLast={isLast}
      event={event}
      onClick={onClick}
      onKeywordClick={onKeywordClick}
      onActorClick={onActorClick}
      onGroupClick={onGroupClick}
      onGroupMemberClick={onGroupMemberClick}
      style={style}
    />
  );
};

export const getItemHeight = (e: SearchEvent, isDownMD: boolean): number => {
  switch (e.type) {
    default: {
      if (isDownMD) {
        return (
          180 +
          (isValidValue(e.excerpt as any) ? 100 : 0) +
          (e.keywords.length > 0 ? 50 : 0) +
          (e.media.length > 0 ? 400 : 0) +
          (e.links.length > 0 ? 50 : 0)
        );
      }
      return (
        180 +
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
}

const initialState: SearchEventQueryResult = {
  events: [],
  actors: [],
  groups: [],
  groupsMembers: [],
  keywords: [],
  totals: { uncategorized: 0, deaths: 0, patents: 0, scientificStudies: 0 },
};

const _loadedRowsMap: Record<number, JSX.Element> = {};

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
  const [searchEvents, setSearchEvents] = React.useState(initialState);

  const itemProps = {
    onClick,
    onActorClick,
    onGroupClick,
    onGroupMemberClick,
    onKeywordClick,
  };

  const totalEvents = React.useMemo(
    () =>
      [
        queryParams.type?.includes(Death.DEATH.value)
          ? searchEvents.totals.deaths
          : 0,
        queryParams.type?.includes(Uncategorized.UncategorizedType.value)
          ? searchEvents.totals.uncategorized
          : 0,
        queryParams.type?.includes(ScientificStudy.ScientificStudyType.value)
          ? searchEvents.totals.scientificStudies
          : 0,
        queryParams.type?.includes(Patent.PATENT.value)
          ? searchEvents.totals.patents
          : 0,
      ].reduce((acc, tot) => acc + tot, 0),
    [searchEvents.totals]
  );

  const isRowLoaded = (params: Index): boolean => {
    const rowLoaded =
      searchEvents.events[params.index] !== undefined &&
      _loadedRowsMap[params.index] !== undefined;
    // console.log("row loaded", { ...params, rowLoaded });
    return rowLoaded;
  };

  const getRowHeight = React.useCallback(
    ({ index }: Index) => {
      const event = searchEvents.events[index];

      return event ? getItemHeight(event, isDownSM) : 150;
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

  const handleLoadMoreRows = async (params: IndexRange): Promise<void> => {
    if (
      params.startIndex < searchEvents.events.length &&
      params.stopIndex < searchEvents.events.length
    ) {
      return await Promise.resolve(undefined);
    }
    // console.log("load more rows", { ...params, totalEvents });
    void onLoadMoreEvents(params);
  };

  React.useEffect(() => {
    void onLoadMoreEvents({ startIndex: 0, stopIndex: 20 });
  }, [hash]);

  // console.log("events", { totalEvents, events: searchEvents.events });

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
                    if (props.index >= searchEvents.events.length) {
                      return <div key={props.key} style={{ height: 100 }} />;
                    }

                    const event = searchEvents.events[props.index];
                    const isLast = props.index === totalEvents - 1;

                    const row = (
                      <Row
                        {...itemProps}
                        {...props}
                        key={event.id}
                        event={event}
                        isLast={isLast}
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
