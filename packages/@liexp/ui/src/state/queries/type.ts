import { type UseQueryResult } from "@tanstack/react-query";
import { type IOError } from "@ts-endpoint/core";

export type UseGetQueryFn<P, Q, T> = (
  params: P,
  q: Partial<Q> | undefined,
  discrete: boolean,
  suffix?: string,
) => UseQueryResult<{ data: T }, IOError>;

export type UseListQueryFn<P, Q, T> = (
  params: P,
  q: Partial<Q> | undefined,
  discrete: boolean,
  suffix?: string,
) => UseQueryResult<{ data: readonly T[]; total: number }, IOError>;

export type UseQueryFn<P, T> = (params: P) => UseQueryResult<T, IOError>;
