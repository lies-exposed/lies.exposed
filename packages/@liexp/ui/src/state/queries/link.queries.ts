// import { type Link } from "@liexp/shared/lib/io/http";
// import type { GetListParams } from "react-admin";
// import { type UseQueryResult, useQuery } from "react-query";
// import { type APIRESTClient } from "../../http/index";
// import { fetchQuery } from "./common";
// import { type FetchQuery, type UseListQueryFn } from "./type";
// import { type Queries, asQueries } from "providers/DataProvider";

// export const defaultGetLinksQueryParams = {
//   sort: {
//     field: "createdAt",
//     order: "DESC" as const,
//   },
//   pagination: {
//     perPage: 20,
//     page: 1,
//   },
//   filter: {},
// };

// export const getLinksQueryKey = (
//   p: Partial<GetListParams>,
//   discrete: boolean,
// ): [string, GetListParams, boolean] => {
//   return [
//     "links",
//     {
//       filter: p.filter ? p.filter : {},
//       pagination: {
//         ...defaultGetLinksQueryParams.pagination,
//         ...p.pagination,
//       },
//       sort: {
//         ...defaultGetLinksQueryParams.sort,
//         ...p.sort,
//       },
//     },
//     discrete,
//   ];
// };
// export const fetchLinks: (
//   dp: APIRESTClient,
// ) => FetchQuery<Queries["Link"]["getList"]> = (dp) =>
//   fetchQuery(asQueries(dp).Link.getList);

// export const useLinksQuery: UseListQueryFn<Link.Link> = (
//   dp,
//   params,
//   discrete,
// ) => {
//   return useQuery(getLinksQueryKey(params, discrete), fetchLinks(dp));
// };

// export const getLinkQueryKey = (id: string): any[] => ["link", { id }];
// export const fetchSingleLink = (dp: APIRESTClient): FetchQuery<Queries['Link']['get']> =>
//   fetchQuery(asQueries(dp).Link.get);

// export const useGetLinkQuery = (
//   dp: APIRESTClient,
//   id: string,
// ): UseQueryResult<Link.Link, any> => {
//   return useQuery(getLinkQueryKey(id), fetchSingleLink(dp));
// };
