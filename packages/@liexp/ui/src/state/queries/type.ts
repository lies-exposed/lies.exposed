import { type UseQueryResult } from "@tanstack/react-query";
import { type IOError } from "@ts-endpoint/core";
import { type GetListParams } from "react-admin";

export type UseListQueryFn<T> = (
  params: Partial<GetListParams>,
  q: any,
  discrete: boolean,
  suffix?: string,
) => UseQueryResult<{ data: readonly T[]; total: number }, IOError>;

export type UseQueryFn<P, T> = (params: P) => UseQueryResult<T, IOError>;
