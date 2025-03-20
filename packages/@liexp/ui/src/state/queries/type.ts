import { type APIError } from "@liexp/shared/lib/io/http/Error/APIError.js";
import { type UseQueryResult } from "@tanstack/react-query";
import { type GetListParams } from "react-admin";

export type UseListQueryFn<T> = (
  params: Partial<GetListParams>,
  q: any,
  discrete: boolean,
  suffix?: string,
) => UseQueryResult<{ data: readonly T[]; total: number }, APIError>;

export type UseQueryFn<P, T> = (params: P) => UseQueryResult<T, APIError>;
