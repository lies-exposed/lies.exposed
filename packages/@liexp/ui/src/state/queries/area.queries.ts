// import { type Area } from "@liexp/shared/lib/io/http";
// import type { GetListParams } from "react-admin";
// import { useQuery } from "react-query";
// import { type APIRESTClient } from "../../http/APIRESTClient.js";
// import {
//   type Queries,
//   asQueries
// } from "../../providers/DataProvider.js";
// import { fetchQuery } from "./common";
// import { type FetchQuery, type UseListQueryFn, type UseQueryFn } from "./type";

// export const getAreaQueryKey = (
//   p: Partial<GetListParams>,
//   discrete: boolean,
// ): [string, GetListParams, boolean] => {
//   return [
//     "areas",
//     {
//       filter: p.filter ?? {},
//       pagination: {
//         perPage: 20,
//         page: 1,
//         ...p.pagination,
//       },
//       sort: {
//         field: "createdAt",
//         order: "DESC",
//         ...p.sort,
//       },
//     },
//     discrete,
//   ];
// };
// export const fetchAreas = (dataProvider: APIRESTClient): FetchQuery<Queries['Area']['getList']> =>
//   fetchQuery(asQueries(dataProvider).Area.getList);

// export const useAreasQuery: UseListQueryFn<Area.Area> = (
//   dp,
//   params,
//   discrete,
// ) => {
//   return useQuery(getAreaQueryKey(params, discrete), fetchAreas(dp));
// };

// export const fetchArea =
//   (dp: APIRESTClient) =>
//   async ({ queryKey }: any): Promise<Area.Area> => {
//     return await asQueries(dp).Area.get({ id: queryKey[1].id });
//   };

// export const useAreaQuery: UseQueryFn<{ id: string }, Area.Area> = (
//   dp,
//   params,
// ) => {
//   return useQuery(["areas", params], fetchArea(dp));
// };
