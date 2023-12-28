// import { type Keyword } from "@liexp/shared/lib/io/http";
// import { type APIError } from "@liexp/shared/lib/io/http/Error/APIError";
// import type { GetListParams, GetOneParams } from "react-admin";
// import { useQuery, type UseQueryResult } from "react-query";
// import { type APIRESTClient } from '../../http';
// import { type Queries, asQueries } from "../../providers/DataProvider";
// import { fetchQuery } from "./common";
// import { type FetchQuery, type UseListQueryFn, type UseQueryFn } from "./type";

// export const fetchKeywords: (dp: APIRESTClient) => FetchQuery<Queries['Keyword']['getList']> = (dp) =>
//   fetchQuery(asQueries(dp).Keyword.getList);

// export const getKeywordsQueryKey = (
//   suffix: string,
//   p: Partial<GetListParams>,
//   discrete: boolean,
// ): [string, GetListParams, boolean] => {
//   return [
//     `keywords-${suffix}`,
//     {
//       filter: p.filter ? p.filter : {},
//       pagination: {
//         perPage: 20,
//         page: 1,
//         ...p.pagination,
//       },
//       sort: {
//         order: "DESC",
//         field: "createdAt",
//         ...p.sort,
//       },
//     },
//     discrete,
//   ];
// };

// export const useKeywordsQuery: UseListQueryFn<Keyword.Keyword> = (
//   dp,
//   params,
//   discrete,
//   suffix = "",
// ) => {
//   return useQuery(getKeywordsQueryKey(suffix, params, discrete), fetchKeywords(dp));
// };

// export const useKeywordQuery = (
//   dp: APIRESTClient,
//   params: GetOneParams,
// ): UseQueryResult<Keyword.Keyword, APIError> => {
//   return useQuery(["keywords", params], async () => {
//     return await asQueries(dp).Keyword.get(params);
//   });
// };

// export const getKeywordsDistributionQueryKey = (params: any): any[] => {
//   return ["keywords", "distribution", params];
// };

// export const fetchKeywordsDistribution = (dp: APIRESTClient) => async ({
//   queryKey,
// }: any): Promise<{ data: Keyword.Keyword[]; total: number }> => {
//   return await asQueries(dp).Keyword.Custom.Distribution({ Query: queryKey[2] });
// };

// export const useKeywordsDistributionQuery: UseQueryFn<
//   any,
//   { data: Keyword.Keyword[]; total: number }
// > = (dp, params) => {
//   return useQuery(
//     getKeywordsDistributionQueryKey(params),
//     fetchKeywordsDistribution(dp),
//   );
// };
