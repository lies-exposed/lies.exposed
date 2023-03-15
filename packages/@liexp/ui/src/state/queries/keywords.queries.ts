import { type Keyword } from "@liexp/shared/io/http";
import { type APIError } from "@liexp/shared/providers/http/http.provider";
import type { GetListParams, GetOneParams } from "react-admin";
import { useQuery, type UseQueryResult } from "react-query";
import { Queries } from "../../providers/DataProvider";
import { fetchQuery } from "./common";
import { type UseQueryFn, type FetchQuery, type UseListQueryFn } from "./type";

export const fetchKeywords: FetchQuery<typeof Queries.Keyword.getList> =
  fetchQuery(Queries.Keyword.getList);

export const getKeywordsQueryKey = (
  suffix: string,
  p: Partial<GetListParams>,
  discrete: boolean
): [string, GetListParams, boolean] => {
  return [
    `keywords-${suffix}`,
    {
      filter: p.filter ? p.filter : {},
      pagination: {
        perPage: 20,
        page: 1,
        ...p.pagination,
      },
      sort: {
        order: "DESC",
        field: "createdAt",
        ...p.sort,
      },
    },
    discrete,
  ];
};

export const useKeywordsQuery: UseListQueryFn<Keyword.Keyword> = (
  params,
  discrete,
  suffix = ""
) => {
  return useQuery(getKeywordsQueryKey(suffix, params, discrete), fetchKeywords);
};

export const useKeywordQuery = (
  params: GetOneParams
): UseQueryResult<Keyword.Keyword, APIError> => {
  return useQuery(["keywords", params], async () => {
    return await Queries.Keyword.get(params);
  });
};

export const getKeywordsDistributionQueryKey = (params: any): any[] => {
  return ["keywords", "distribution", params];
};

export const fetchKeywordsDistribution = async ({
  queryKey,
}: any): Promise<{ data: Keyword.Keyword[]; total: number }> => {
  return await Queries.Keyword.Custom.Distribution({ Query: queryKey[2] });
};

export const useKeywordsDistributionQuery: UseQueryFn<
  any,
  { data: Keyword.Keyword[]; total: number }
> = (params) => {
  return useQuery(
    getKeywordsDistributionQueryKey(params),
    fetchKeywordsDistribution
  );
};
