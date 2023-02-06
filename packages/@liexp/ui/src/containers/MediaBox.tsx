import { type Media } from "@liexp/shared/io/http";
import * as React from "react";
import { InfiniteLoader, type Index, type IndexRange } from "react-virtualized";
import { type serializedType } from "ts-io-error/lib/Codec";
import { FullSizeLoader } from "../components/Common/FullSizeLoader";
import { MediaList } from "../components/lists/MediaList";
import { Box } from "../components/mui";
import { type Endpoints } from "../providers/DataProvider";
import { useMediaInfiniteQuery } from "../state/queries/media.queries";

export interface MediaBoxProps {
  filter: Partial<serializedType<typeof Endpoints.Media.List.Input.Query>>;
  onClick: (e: Media.Media) => void;
}

export const MediaBox: React.FC<MediaBoxProps> = ({ filter, onClick }) => {
  const {
    data,
    // refetch,
    isFetchingNextPage,
    isFetching,
    hasNextPage,
    fetchNextPage,
  } = useMediaInfiniteQuery({ filter });

  const [rowsCache, setRowsCache] = React.useState<Record<number, boolean>>({});

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

  // React.useEffect(() => {
  //   void refetch({ refetchPage: () => true });
  // }, []);

  console.log(data?.pages);

  if (!data?.pages) {
    return <FullSizeLoader />;
  }

  return (
    <Box style={{ height: "100%" }}>
      <InfiniteLoader
        isRowLoaded={isRowLoaded}
        loadMoreRows={handleLoadMoreRows}
        minimumBatchSize={20}
      >
        {({ onRowsRendered, registerChild }) => (
          <MediaList
            ref={registerChild}
            onRowsRendered={(params: IndexRange) => {
              const updateRowsCache: Record<number, boolean> = {};
              for (let i = params.startIndex; i <= params.stopIndex; i++) {
                updateRowsCache[i] = true;
              }

              setTimeout(() => {
                setRowsCache((c) => ({
                  ...c,
                  ...updateRowsCache,
                }));
                onRowsRendered(params);
              }, 0);
            }}
            total={data?.pages?.[0].total ?? media.length}
            media={media.map((m) => ({ ...m, selected: true }))}
            onItemClick={onClick}
            columnWidth={300}
          />
        )}
      </InfiniteLoader>
    </Box>
  );
};
