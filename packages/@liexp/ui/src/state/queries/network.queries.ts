// import { type APIError } from "@liexp/shared/lib/io/http/Error/APIError";
// import {
//   type GetNetworkParams,
//   type GetNetworkQuery,
//   type NetworkGraphOutput,
// } from "@liexp/shared/lib/io/http/Network";
// import { useQuery, type UseQueryResult } from "@tanstack/react-query";
// import { type serializedType } from "ts-io-error/lib/Codec";
// import { Queries } from "../../providers/DataProvider";
// import { fetchQuery } from "./common";
// import { type FetchQuery } from "./type";

// export const fetchNetworkGraph: FetchQuery<any> = fetchQuery(
//   Queries.Networks.get,
// );

// export const useNetworkGraphQuery = (
//   params: GetNetworkParams,
//   query: Partial<serializedType<typeof GetNetworkQuery>>,
//   discrete: boolean | undefined = true,
// ): UseQueryResult<NetworkGraphOutput, APIError> => {
//   return useQuery(
//     [
//       `network-${params.type}${query.ids ? `-${query.ids.join("-")}` : ""}`,
//       {
//         ...params,
//         pagination: {
//           perPage: 1,
//           page: 1,
//         },
//         sort: {
//           order: "DESC",
//           field: "date",
//         },
//         ...query,
//         emptyRelations: query.emptyRelations ?? undefined,
//       },
//       discrete,
//     ],
//     fetchNetworkGraph,
//   );
// };

// export const fetchHierarchyNetworkGraph: FetchQuery<any> = fetchQuery(
//   (p: GetNetworkParams) => Queries.Networks.get({ ...p, type: "hierarchy" }),
// );

// export const useHierarchyNetworkGraphQuery = (
//   params: GetNetworkParams,
//   query: Partial<serializedType<typeof GetNetworkQuery>>,
// ): UseQueryResult<NetworkGraphOutput, APIError> => {
//   return useQuery(
//     [
//       `network-${params.type}${query.ids ? `-${query.ids.join("-")}` : ""}`,
//       {
//         ...params,
//         pagination: {
//           perPage: 1,
//           page: 1,
//         },
//         sort: {
//           order: "DESC",
//           field: "date",
//         },
//         ...query,
//         emptyRelations: query.emptyRelations ?? undefined,
//       },
//     ],
//     fetchHierarchyNetworkGraph,
//   );
// };
