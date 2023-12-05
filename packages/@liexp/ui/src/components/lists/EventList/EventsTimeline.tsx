import { EventTotalsMonoid } from "@liexp/shared/lib/io/http/Events/EventTotals.js";
import { EventTypes } from "@liexp/shared/lib/io/http/Events/EventType.js";
import * as React from "react";
import {
  AutoSizer,
  InfiniteLoader,
  type Index,
  type IndexRange,
} from "react-virtualized";
import { useAPI } from "../../../hooks/useAPI.js";
import {
  searchEventsInfiniteQuery,
  type SearchEventQueryInput,
} from "../../../state/queries/SearchEventsQuery.js";
import { FullSizeLoader } from "../../Common/FullSizeLoader.js";
import { Box } from "../../mui/index.js";
import { type EventListItemProps } from "./EventListItem.js";
import EventsTimelineList from "./EventsTimelineList.js";

export interface EventsTimelineProps
  extends Omit<EventListItemProps, "event" | "onRowInvalidate"> {
  className?: string;
  hash: string;
  queryParams: Omit<SearchEventQueryInput, "hash" | "_start" | "_end">;
}

const EventsTimeline: React.FC<EventsTimelineProps> = (props) => {
  const { hash, queryParams, ...listProps } = props;
  const api = useAPI();
  // const isDownSM = useMediaQuery(theme.breakpoints.down("sm"));

  const {
    data,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    isRefetching,
    refetch,
  } = searchEventsInfiniteQuery(api)(queryParams);

  const searchEvents =
    data?.pages !== undefined
      ? data.pages.reduce(
          (acc, p) => ({
            events: acc.events.concat(p.events),
            actors: acc.actors.concat(p.actors),
            groups: acc.groups.concat(p.groups),
            groupsMembers: acc.groupsMembers.concat(p.groupsMembers),
            media: acc.media.concat(p.media),
            keywords: acc.keywords.concat(p.keywords),
            links: acc.links.concat(p.links),
            total: p.total,
            totals: p.totals,
            firstDate: p.firstDate ?? acc.firstDate,
            lastDate: p.lastDate ?? acc.lastDate,
          }),
          {
            events: [] as any[],
            actors: [] as any[],
            groups: [] as any[],
            groupsMembers: [] as any[],
            media: [] as any[],
            keywords: [] as any[],
            links: [] as any[],
            total: 0,
            totals: EventTotalsMonoid.empty,
            firstDate: new Date().toISOString(),
            lastDate: new Date().toISOString(),
          },
        )
      : undefined;

  const totalEvents = React.useMemo(
    () =>
      [
        queryParams.eventType?.includes(EventTypes.DEATH.value)
          ? searchEvents?.totals.deaths ?? 0
          : 0,
        queryParams.eventType?.includes(EventTypes.UNCATEGORIZED.value)
          ? searchEvents?.totals.uncategorized ?? 0
          : 0,
        queryParams.eventType?.includes(EventTypes.SCIENTIFIC_STUDY.value)
          ? searchEvents?.totals.scientificStudies ?? 0
          : 0,
        queryParams.eventType?.includes(EventTypes.PATENT.value)
          ? searchEvents?.totals.patents ?? 0
          : 0,
        queryParams.eventType?.includes(EventTypes.DOCUMENTARY.value)
          ? searchEvents?.totals.documentaries ?? 0
          : 0,
      ].reduce((acc, tot) => acc + tot, 0),
    [searchEvents?.totals ?? {}],
  );

  const isRowLoaded = (params: Index): boolean => {
    const rowLoaded = searchEvents?.events[params.index] !== undefined;
    return rowLoaded;
  };

  const handleLoadMoreRows = async (params: IndexRange): Promise<void> => {
    if (hasNextPage && !isFetchingNextPage && !isFetching) {
      const cacheSize = searchEvents?.events.length ?? 0;
      if (params.startIndex >= cacheSize || params.stopIndex > cacheSize) {
        await fetchNextPage({});
      }
    }
    await Promise.resolve(undefined);
  };

  React.useEffect(() => {
    void refetch({});
  }, [hash]);

  if (isRefetching || !searchEvents) {
    return <FullSizeLoader />;
  }

  return (
    <Box
      style={{
        display: "flex",
        flexGrow: 1,
        flexShrink: 0,
        flexBasis: "auto",
        height: "100%",
      }}
    >
      <InfiniteLoader
        isRowLoaded={isRowLoaded}
        loadMoreRows={handleLoadMoreRows}
        rowCount={totalEvents}
        minimumBatchSize={20}
      >
        {({ onRowsRendered, registerChild }) => (
          <AutoSizer style={{ height: "100%" }}>
            {({ width, height }) => {
              return (
                <EventsTimelineList
                  {...listProps}
                  width={width}
                  height={height}
                  total={totalEvents}
                  events={searchEvents}
                  ref={registerChild}
                  onRowsRendered={onRowsRendered}
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
