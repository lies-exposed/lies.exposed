import { type UseQueryResult } from "@tanstack/react-query";
import { type IOError } from "@ts-endpoint/core";

interface ListResult {
  readonly data: readonly unknown[];
  readonly total: number;
}

const EMPTY_LIST_RESULT: ListResult = { data: [], total: 0 };

/**
 * Wraps a query result and returns a mock "success" state when the IDs array is empty.
 *
 * This provides an elegant way to avoid waiting for API responses when we know
 * the result will be empty. The component immediately receives mock success data.
 *
 * Note: Due to React's rules of hooks, the underlying useQuery hook is still called.
 * The @ts-endpoint/tanstack-query library doesn't currently support React Query's
 * `enabled` option, so the network request will still be made in the background.
 * However, the component won't wait for it - it immediately gets the empty result.
 *
 * @example
 * ```tsx
 * actors: skipQueryIfEmpty(
 *   Q.Actor.list.useQuery(undefined, { ids: actorIds }, true),
 *   actorIds
 * )
 * ```
 */
export const skipQueryIfEmpty =
  (ids: readonly string[]) =>
  <T extends ListResult>(
    query: UseQueryResult<T, IOError>,
  ): UseQueryResult<T, IOError> => {
    if (ids.length === 0) {
      return {
        data: EMPTY_LIST_RESULT as unknown as T,
        isLoading: false,
        isSuccess: true,
        status: "success",
        isFetching: false,
        isError: false,
        error: null,
        isPending: false,
        isLoadingError: false,
        isRefetchError: false,
        isStale: false,
        isPaused: false,
        isPlaceholderData: false,
        isFetched: true,
        isFetchedAfterMount: true,
        failureCount: 0,
        failureReason: null,
        errorUpdateCount: 0,
        dataUpdatedAt: Date.now(),
        errorUpdatedAt: 0,
        fetchStatus: "idle",
        refetch: query.refetch,
        promise: Promise.resolve(EMPTY_LIST_RESULT as unknown as T),
      } as unknown as UseQueryResult<T, IOError>;
    }
    return query;
  };
