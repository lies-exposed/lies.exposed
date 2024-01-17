// import { type Media } from "@liexp/shared/lib/io/http";
// import { type APIError } from "@liexp/shared/lib/io/http/Error/APIError";
// import type { GetListParams } from "react-admin";
// import {
//   useInfiniteQuery,
//   type UseInfiniteQueryResult
// } from "@tanstack/react-query";

// export const getMediaQueryListKey = (
//   p: Partial<GetListParams>,
//   discrete: boolean,
// ): [string, GetListParams, boolean] => {
//   return [
//     "media",
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

// export const useMediaInfiniteQuery = (
//   input: Partial<GetListParams>,
// ): UseInfiniteQueryResult<{ data: Media.Media[]; total: number }, APIError> => {
//   return useInfiniteQuery(
//     getMediaQueryListKey(input, false),
//     ({ queryKey, pageParam }: any) => {
//       const params = queryKey[1];
//       // console.log("params", params);
//       // console.log("page param", pageParam);
//       const stopIndex = pageParam?.stopIndex ?? 20;
//       const page = stopIndex <= 20 ? 1 : stopIndex % 20;
//       queryKey[1] = {
//         ...params,
//         pagination: {
//           perPage: 20,
//           page,
//         },
//       };
//       // console.log("query key", queryKey);

//       return fetchMedia({ queryKey });
//     },
//     {
//       refetchOnWindowFocus: false,
//       refetchOnMount: false,
//       getNextPageParam: (lastPage, allPages) => {
//         const loadedEvents = allPages.flatMap((p) => p.data).length;

//         if (loadedEvents >= lastPage.total) {
//           return undefined;
//         }

//         return { startIndex: loadedEvents, stopIndex: loadedEvents + 20 };
//       },
//     },
//   );
// };
