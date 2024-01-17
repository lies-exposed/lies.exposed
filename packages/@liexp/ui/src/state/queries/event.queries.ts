// import { type Events } from "@liexp/shared/lib/io/http";
// import type { GetListParams, GetOneParams } from "react-admin";
// import { useQuery } from "@tanstack/react-query";
// import { Queries } from "../../providers/DataProvider";
// import { fetchQuery } from "./common";
// import { type UseListQueryFn, type UseQueryFn } from "./type";

// export const getEventQueryKey = (p: GetOneParams): [string, GetOneParams] => [
//   "event",
//   {
//     ...p,
//   },
// ];

// export const fetchEvent = async ({ queryKey }: any): Promise<Events.Event> =>
//   await Queries.Event.get(queryKey[1]);

// export const useEventQuery: UseQueryFn<GetOneParams, Events.Event> = (
//   params,
// ) => {
//   return useQuery(getEventQueryKey(params), fetchEvent);
// };

// export const getEventsQueryKey = (
//   p: Partial<GetListParams>,
//   discrete: boolean,
// ): [string, GetListParams, boolean] => {
//   return [
//     "events",
//     {
//       filter: p.filter ?? {},
//       pagination: {
//         perPage: 20,
//         page: 1,
//         ...p.pagination,
//       },
//       sort: {
//         order: "DESC",
//         field: "date",
//         ...p.sort,
//       },
//     },
//     discrete,
//   ];
// };

// export const fetchEvents: (a: any) => Promise<any> = fetchQuery(
//   Queries.Event.getList,
// );

// export const useEventsQuery: UseListQueryFn<Events.Event> = (
//   params,
//   discrete,
// ) => {
//   return useQuery(getEventsQueryKey(params, discrete), fetchEvents);
// };
