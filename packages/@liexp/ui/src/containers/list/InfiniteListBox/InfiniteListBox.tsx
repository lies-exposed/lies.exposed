import { type Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { type APIError } from "@liexp/shared/lib/io/http/Error/APIError.js";
import { type QueryProviderCustomQueries } from "@liexp/shared/lib/providers/EndpointQueriesProvider/overrides.js";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
  type EndpointOutputType,
  type EndpointQueryType,
  type MinimalEndpointInstance,
} from "@ts-endpoint/core";
import {
  type EndpointDataOutputType,
  type GetListFnParamsE,
  paramsToPagination,
} from "@ts-endpoint/react-admin";
import {
  type EndpointsQueryProvider,
  type ResourceQuery,
} from "@ts-endpoint/tanstack-query";
import * as React from "react";
import {
  AutoSizer,
  type CellMeasurerCache,
  type Index,
  InfiniteLoader,
  type Masonry,
} from "react-virtualized";
import { ErrorBox } from "../../../components/Common/ErrorBox.js";
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

export interface InfiniteListBoxProps<
  T extends ListType,
  E extends MinimalEndpointInstance,
> {
  listProps: ListProps<T>;
  useListQuery: (
    queryProvider: EndpointsQueryProvider<
      Endpoints,
      QueryProviderCustomQueries
    >,
  ) => ResourceQuery<
    GetListFnParamsE<E>,
    Partial<EndpointQueryType<E>>,
    EndpointOutputType<E>
  >;
  filter: GetListFnParamsE<E>;
  toItems?: (data: EndpointDataOutputType<E>) => any[];
  getTotal?: (data: EndpointDataOutputType<E>) => number;
}

export const InfiniteListBox = <
  T extends ListType,
  E extends MinimalEndpointInstance,
>({
  useListQuery,
  filter,
  listProps,
  toItems = (r: EndpointDataOutputType<E>) => r.data,
  getTotal = (r: EndpointDataOutputType<E>) => r.total,
  ...rest
}: InfiniteListBoxProps<T, E>): React.ReactElement => {
  const [{ masonryRef, cellCache }, setMasonryRef] = React.useState<{
    masonryRef: Masonry | null;
    cellCache: CellMeasurerCache | null;
  }>({
    masonryRef: null,
    cellCache: null,
  });

  const Q = useEndpointQueries();

  const query = React.useMemo(() => {
    return useListQuery(Q);
  }, [useListQuery]);

  const queryKey = query.getKey(filter, undefined, false, "infinite-list");

  const {
    data,
    error,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    isRefetching,
    isError,
  } = useInfiniteQuery<
    any,
    APIError,
    {
      pages: EndpointDataOutputType<E>[];
      pageParams: Array<{ _start: number; _end: number }>;
    },
    any,
    { _start: number; _end: number }
  >({
    initialPageParam: { _start: 0, _end: 20 },
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey,
    queryFn: (opts) => {
      const pageParam = paramsToPagination(
        opts.pageParam._start,
        opts.pageParam._end,
      );

      return query.fetch(
        {
          ...filter,
          filter: filter.filter,
          pagination: pageParam,
        },
        {
          ...filter.filter,
          ...opts.pageParam,
        } as any,
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
    const items = (data?.pages ?? []).flatMap((p) => toItems(p));
    const total = data?.pages?.[0] ? getTotal(data.pages[0]) : 0;
    return { items, total };
  }, [data, filter]);

  const handleLoadMoreRows = React.useCallback(async () => {
    if (hasNextPage && !(isFetchingNextPage || isRefetching)) {
      // const pageParams = {
      //   _start: props.startIndex,
      //   _end: props.stopIndex + 1 - props.startIndex,
      // } as any;
      // console.log("handleLoadMoreRows", pageParams);
      await fetchNextPage({ cancelRefetch: true });
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, isRefetching]);

  React.useEffect(() => {
    if (masonryRef && cellCache && !(isFetching || isRefetching)) {
      cellCache.clearAll();
      masonryRef.clearCellPositions();
      masonryRef.recomputeCellPositions();
      masonryRef.forceUpdate();
    }
  }, [filter, total]);

  if (isError || error) {
    return <ErrorBox error={error} resetErrorBoundary={() => {}} />;
  }

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
            if (listProps.type === "masonry") {
              return (
                <InfiniteMasonry
                  {...listProps}
                  width={width}
                  height={height}
                  total={total}
                  items={items}
                  ref={registerChild}
                  onMasonryRef={(r: Masonry, cellCache: CellMeasurerCache) => {
                    setMasonryRef({ masonryRef: r, cellCache });
                  }}
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
                {...listProps}
              />
            );
          }}
        </AutoSizer>
      )}
    </InfiniteLoader>
  );
};
