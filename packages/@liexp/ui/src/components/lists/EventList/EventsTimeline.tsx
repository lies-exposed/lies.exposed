import {
  Death,
  Documentary,
  Patent,
  ScientificStudy,
  Uncategorized
} from "@liexp/shared/io/http/Events";
import { EventTotals } from "@liexp/shared/io/http/Events/SearchEventsQuery";
import * as React from "react";
import {
  Index,
  IndexRange,
  InfiniteLoader
} from "react-virtualized";
import {
  SearchEventQueryInput,
  searchEventsInfiniteQuery
} from "../../../state/queries/SearchEventsQuery";
import { FullSizeLoader } from "../../Common/FullSizeLoader";
import { Box } from '../../mui';
import { EventListItemProps } from "./EventListItem";
import EventsTimelineList from "./EventsTimelineList";

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
    ...listProps
  } = props;

  // const isDownSM = useMediaQuery(theme.breakpoints.down("sm"));

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
            media: acc.media.concat(p.media),
            keywords: acc.keywords.concat(p.keywords),
            total: p.total,
            totals: p.totals,
          }),

          {
            events: [] as any[],
            actors: [] as any[],
            groups: [] as any[],
            groupsMembers: [] as any[],
            media: [] as any[],
            keywords: [] as any[],
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
          <EventsTimelineList
            {...listProps}
            total={totalEvents}
            events={searchEvents}
            ref={registerChild}
            onRowsRendered={onRowsRendered}
          />
        )}
      </InfiniteLoader>
    </Box>
  );
};

export default EventsTimeline;
