// import { type Group } from "@liexp/shared/lib/io/http";
// import { type APIError } from "@liexp/shared/lib/io/http/Error/APIError";
// import type { GetListParams, GetOneParams } from "react-admin";
// import { useQuery, type UseQueryResult } from "react-query";
// import { Queries } from "../../providers/DataProvider";
// import { fetchQuery } from "./common";
// import { type FetchQuery, type UseListQueryFn } from "./type";

// export const getGroupsQueryKey = (
//   suffix: string,
//   p: Partial<GetListParams>,
//   discrete: boolean,
// ): [string, GetListParams, boolean] => {
//   return [
//     `groups-${suffix}`,
//     {
//       filter: p.filter ? p.filter : {},
//       pagination: {
//         perPage: 20,
//         page: 1,
//         ...p.pagination,
//       },
//       sort: {
//         order: "DESC",
//         field: "updatedAt",
//         ...p.sort,
//       },
//     },
//     discrete,
//   ];
// };

// export const fetchGroups: FetchQuery<typeof Queries.Group.getList> = fetchQuery(
//   Queries.Group.getList,
// );

// export const useGroupsQuery: UseListQueryFn<Group.Group> = (
//   params,
//   discrete,
//   suffix = "",
// ) => {
//   return useQuery(getGroupsQueryKey(suffix, params, discrete), fetchGroups);
// };

// export const fetchGroup = async ({ queryKey }: any): Promise<Group.Group> => {
//   return await Queries.Group.get({ id: queryKey[1].id });
// };

// export const useGroupQuery = (
//   params: GetOneParams,
// ): UseQueryResult<Group.Group, APIError> => {
//   return useQuery(["groups", params], fetchGroup);
// };
