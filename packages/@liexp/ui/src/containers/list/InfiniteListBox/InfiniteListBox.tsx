import { type APIError } from "@liexp/shared/lib/io/http/Error/APIError.js";
import { type EndpointsQueryProvider } from "@liexp/shared/lib/providers/EndpointQueriesProvider/index.js";
import { type ResourceQuery } from "@liexp/shared/lib/providers/EndpointQueriesProvider/types.js";
import { paramsToPagination } from "@liexp/shared/lib/providers/api-rest.provider.js";
import { useInfiniteQuery } from "@tanstack/react-query";
import React from "react";
import { AutoSizer, InfiniteLoader, type Index } from "react-virtualized";
import { FullSizeLoader } from "../../../components/Common/FullSizeLoader.js";
import { useEndpointQueries } from "../../../hooks/useEndpointQueriesProvider.js";
import { InfiniteList, type InfiniteListProps } from "./InfiniteList.js";
import {
  InfiniteMasonry,
  type InfiniteMasonryProps,
} from "./InfiniteMasonry.js";

export type ListType = "masonry" | "list";

type ListProps<T extends ListType> = T extends "masonry"
  ? { type: "masonry" } & Omit<
      InfiniteMasonryProps,
      "width" | "height" | "items" | "cellMeasureCache"
    >
  : { type: "list" } & Omit<
      InfiniteListProps,
      "width" | "height" | "items" | "onRowsRendered"
    >;

export interface InfiniteListBoxProps<T extends ListType> {
  listProps: ListProps<T>;
  useListQuery: <R>(
    queryProvider: EndpointsQueryProvider,
  ) => R extends ResourceQuery<infer P, infer G, infer A>
    ? ResourceQuery<P, G, A>
    : never;
}

export const InfiniteListBox = <T extends ListType>({
  useListQuery,
  ...rest
}: InfiniteListBoxProps<T>): JSX.Element => {
  const Q = useEndpointQueries();

  const query = React.useMemo(() => {
    return useListQuery<any>(Q);
  }, [useListQuery]);

  const queryKey = query.getKey({} as any, undefined, false, "infinite-list");

  const {
    data,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    isRefetching,
    // refetch,
  } = useInfiniteQuery<
    any,
    APIError,
    {
      pages: Array<{ data: any[]; total: number }>;
      lastPage: { data: any[]; total: number };
    },
    any,
    { _start: number; _end: number }
  >({
    initialPageParam: { _start: 0, _end: 20 },
    queryKey,
    queryFn: (opts) => {
      const pageParam: any = paramsToPagination(
        opts.pageParam._start,
        opts.pageParam._end,
      );

      return query.fetch(
        {
          pagination: pageParam,
          filter: null,
        },
        undefined,
        false,
      );
    },
    getNextPageParam: (lastPage, allPages, lastPageParam, allPageParams) => {
      // console.log("get next params", {
      //   lastPage,
      //   allPages,
      //   lastPageParam,
      //   allPageParams,
      // });
      return { _start: lastPageParam._end, _end: lastPageParam._end + 20 };
    },
  });

  const isRowLoaded = (params: Index): boolean => {
    const rowLoaded = items[params.index] !== undefined;
    return rowLoaded;
  };

  const { items, total } = React.useMemo(() => {
    // console.log('data', data);
    const items = data?.pages.flatMap((p) => p.data) ?? [];
    const total = data?.pages[0]?.total ?? 0;
    return { items, total };
  }, [data]);

  const handleLoadMoreRows = React.useCallback(
    async (props: any) => {
      if (hasNextPage && !(isFetchingNextPage || isRefetching)) {
        const pageParams = {
          _start: props.startIndex,
          _end: props.stopIndex + 1 - props.startIndex,
        } as any;
        // console.log("handleLoadMoreRows", pageParams);
        await fetchNextPage(pageParams);
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage, isRefetching],
  );

  if (isFetching && items.length === 0) {
    return <FullSizeLoader />;
  }

  return (
    <InfiniteLoader
      isRowLoaded={isRowLoaded}
      loadMoreRows={handleLoadMoreRows}
      rowCount={total}
      minimumBatchSize={20}
    >
      {({ onRowsRendered, registerChild }) => (
        <AutoSizer style={{ height: "100%", width: "100%" }}>
          {({ width, height }) => {
            if (rest.listProps.type === "masonry") {
              return (
                <InfiniteMasonry
                  {...rest.listProps}
                  width={width}
                  height={height}
                  total={total}
                  items={items}
                  ref={registerChild}
                  onCellsRendered={onRowsRendered}
                />
              );
            }
            return (
              <InfiniteList
                ref={registerChild}
                width={width}
                height={height}
                onRowsRendered={onRowsRendered}
                items={items}
                {...rest.listProps}
              />
            );
          }}
        </AutoSizer>
      )}
    </InfiniteLoader>
  );
};
