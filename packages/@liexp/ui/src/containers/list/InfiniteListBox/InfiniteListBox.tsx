import { type APIError } from "@liexp/io/lib/http/Error/APIError.js";
import { type Endpoints } from "@liexp/shared/lib/endpoints/api/index.js";
import { type QueryProviderCustomQueries } from "@liexp/shared/lib/providers/EndpointQueriesProvider/overrides.js";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
  type EndpointDataOutputType,
  type EndpointOutputType,
  type EndpointParamsType,
  type EndpointQueryType,
  type MinimalEndpointInstance,
} from "@ts-endpoint/core";
import {
  type EndpointsQueryProvider,
  type ResourceQuery,
} from "@ts-endpoint/tanstack-query";
import * as React from "react";
import { ErrorBox } from "../../../components/Common/ErrorBox.js";
import { FullSizeLoader } from "../../../components/Common/FullSizeLoader.js";
import { AutoSizer } from "../../../components/utils/AutoSizer.js";
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
      "width" | "height" | "items"
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
    EndpointParamsType<E>,
    any,
    Partial<EndpointQueryType<E>>,
    EndpointOutputType<E>
  >;
  params: EndpointParamsType<E>;
  filter: Partial<EndpointQueryType<E>>;
  toItems?: (data: EndpointDataOutputType<E>) => any[];
  getTotal?: (data: EndpointDataOutputType<E>) => number;
}

export const InfiniteListBox = <
  T extends ListType,
  E extends MinimalEndpointInstance,
>({
  useListQuery,
  params,
  filter,
  listProps,
  toItems = (r: EndpointDataOutputType<E>) => r.data,
  getTotal = (r: EndpointDataOutputType<E>) => r.total,
}: InfiniteListBoxProps<T, E>): React.ReactElement => {
  const Q = useEndpointQueries();

  const query = React.useMemo(() => {
    return useListQuery(Q);
  }, [Q, useListQuery]);

  const queryKey = query.getKey(params, filter, false, "infinite-list");

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
      pageParams: { _start: number; _end: number }[];
    },
    any,
    { _start: number; _end: number }
  >({
    initialPageParam: { _start: 0, _end: 20 },
    queryKey,
    queryFn: ({ queryKey, pageParam }) => {
      return query.fetch(
        queryKey[0],
        {
          ...queryKey[1],
          _start: pageParam._start,
          _end: pageParam._end,
        },
        false,
      );
    },
    getNextPageParam: (_lastPage, _allPages, lastPageParam) => {
      return { _start: lastPageParam._end, _end: lastPageParam._end + 20 };
    },
  });

  const { items, total } = React.useMemo(() => {
    const currentItems = (data?.pages ?? []).flatMap((p) => toItems(p));
    const currentTotal = data?.pages?.[0] ? getTotal(data.pages[0]) : 0;
    return { items: currentItems, total: currentTotal };
  }, [data, getTotal, toItems]);

  const maybeLoadMore = React.useCallback(
    async ({ stopIndex }: { startIndex: number; stopIndex: number }) => {
      if (!hasNextPage || isFetchingNextPage || isFetching || isRefetching) {
        return;
      }

      if (total > 0 && items.length >= total) {
        return;
      }

      const threshold = Math.max(items.length - 10, 0);
      if (stopIndex >= threshold) {
        await fetchNextPage({ cancelRefetch: true });
      }
    },
    [
      fetchNextPage,
      hasNextPage,
      isFetching,
      isFetchingNextPage,
      isRefetching,
      items.length,
      total,
    ],
  );

  if (isError || error) {
    return <ErrorBox error={error} resetErrorBoundary={() => {}} />;
  }

  if (isFetching && items.length === 0) {
    return <FullSizeLoader />;
  }

  return (
    <AutoSizer style={{ height: "100%", width: "100%" }}>
      {({ width, height }) => {
        if (listProps.type === "masonry") {
          return (
            <InfiniteMasonry
              {...listProps}
              width={width}
              height={height}
              items={items}
              onCellsRendered={(range) => {
                void maybeLoadMore(range);
              }}
            />
          );
        }

        return (
          <InfiniteList
            {...listProps}
            width={width}
            height={height}
            items={items}
            onRowsRendered={(range) => {
              void maybeLoadMore(range);
            }}
          />
        );
      }}
    </AutoSizer>
  );
};
