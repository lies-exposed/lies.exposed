import { type APIError } from "@liexp/shared/providers/http/http.provider";
import { type GetListParams } from "react-admin";
import { type UseQueryResult } from "react-query";

export type FetchQuery<FN extends (...args: any[]) => Promise<any>> = (
  q: any
) => ReturnType<FN>;

export type UseListQueryFn<T> = (
  params: Partial<GetListParams>,
  discrete: boolean
) => UseQueryResult<{ data: T[]; total: number }, APIError>;

export type UseQueryFn<P, T> = (params: P) => UseQueryResult<T, APIError>;
