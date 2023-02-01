import { type Media } from "@liexp/shared/io/http";
import * as React from "react";
import { InfiniteLoader, type Index, type IndexRange } from "react-virtualized";
import { type serializedType } from "ts-io-error/lib/Codec";
import { type Endpoints } from "../../providers/DataProvider";
import { useMediaInfiniteQuery } from "../../state/queries/media.queries";
import MediaList from "../lists/MediaList";
import { Box } from "../mui";

export interface MediaBoxProps {
  filter: Partial<serializedType<typeof Endpoints.Media.List.Input.Query>>;
  onClick: (e: Media.Media) => void;
}

const rowsCache: Record<number, boolean> = {};

export const MediaBox: React.FC<MediaBoxProps> = ({ filter, onClick }) => {
  const {
    data,
    refetch,
    isFetchingNextPage,
    isFetching,
    hasNextPage,
    fetchNextPage,
  } = useMediaInfiniteQuery({ filter });

  const media: Media.Media[] = (data?.pages ?? []).reduce<any[]>(
    (acc, d) => acc.concat(d.data ?? []),
    []
  );

  const isRowLoaded = React.useCallback(
    (params: Index): boolean => {
      // console.log("rows cache", rowsCache);
      const loaded = !!rowsCache[params.index];
      // console.log("row loaded", params.index, loaded);
      return loaded;
    },
    [rowsCache]
  );

  const handleLoadMoreRows = async (params: IndexRange): Promise<void> => {
    if (hasNextPage && !isFetchingNextPage && !isFetching) {
      const cacheSize = media.length ?? 0;
      if (params.stopIndex >= cacheSize + 10) {
        await fetchNextPage({ pageParam: params });
      }
    }
    await Promise.resolve(undefined);
  };

  React.useEffect(() => {
    void refetch({ refetchPage: () => true });
  }, []);

  return (
    <Box style={{ height: "100%" }}>
      <InfiniteLoader
        isRowLoaded={isRowLoaded}
        loadMoreRows={handleLoadMoreRows}
        rowCount={data?.pages[0].total}
        minimumBatchSize={20}
      >
        {({ onRowsRendered, registerChild }) => (
          <MediaList
            ref={registerChild}
            onRowsRendered={(params: IndexRange) => {
              for (let i = params.startIndex; i <= params.stopIndex; i++) {
                rowsCache[i] = true;
              }

              setTimeout(() => {
                onRowsRendered(params);
              }, 100);
            }}
            media={media.map((m) => ({ ...m, selected: true }))}
            onItemClick={onClick}
            columnWidth={200}
          />
        )}
      </InfiniteLoader>
    </Box>
  );
};
