// import { type APIError } from "@liexp/shared/lib/io/http/Error/APIError";
// import {
//   type FlowGraphOutput,
//   type GetFlowGraphParams,
// } from "@liexp/shared/lib/io/http/graphs/FlowGraph";
// import { useQuery, type UseQueryResult } from "@tanstack/react-query";

// // export const useGraphQuery = (id: GraphId): UseQueryResult<any, APIError> => {
// //   return useQuery(["graph", id], async () => {
// //     return await Queries.Graph.get(undefined, { id });
// //   });
// // };

// export const useFlowGraphQuery = (
//   params: GetFlowGraphParams,
//   query: any,
// ): UseQueryResult<{ data: FlowGraphOutput }, APIError> => {
//   return useQuery(["flow-graphs", params.type, params.id], async () => {
//     return await Queries.Graph.Custom.GetGraphByType({
//       Params: params,
//       Query: query,
//     });
//   });
// };
