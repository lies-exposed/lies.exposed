import { type APIError } from "@liexp/shared/lib/io/http/Error/APIError";
import { APIRESTClient } from '../../http/index.js';
import { type GetListParams } from "react-admin";
import { type UseQueryResult } from "react-query";

export type FetchQuery<FN extends (...args: any[]) => Promise<any>> = (
  q: any,
) => ReturnType<FN>;

export type UseListQueryFn<T> = (
  dataProvider: APIRESTClient,
  params: Partial<GetListParams>,
  discrete: boolean,
  suffix?: string,
) => UseQueryResult<{ data: T[]; total: number }, APIError>;

export type UseQueryFn<P, T> = (dataProvider: APIRESTClient, params: P) => UseQueryResult<T, APIError>;
