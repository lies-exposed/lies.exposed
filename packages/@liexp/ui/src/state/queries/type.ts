import { type APIError } from "@liexp/shared/lib/io/http/Error/APIError.js";
import { type GetListParams } from "react-admin";
import { type UseQueryResult } from "react-query";

export type UseListQueryFn<T> = (
  params: Partial<GetListParams>,
  q: any,
  discrete: boolean,
  suffix?: string,
) => UseQueryResult<{ data: T[]; total: number }, APIError>;

export type UseQueryFn<P, T> = (params: P) => UseQueryResult<T, APIError>;
