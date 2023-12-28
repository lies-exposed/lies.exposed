// import { fp } from '@liexp/core/lib/fp';
// import { type Story } from "@liexp/shared/lib/io/http";
// import * as io from '@liexp/shared/lib/io/index';
// import { liftFetch } from '@liexp/shared/lib/providers/http/http.provider';
// import { throwTE } from '@liexp/shared/lib/utils/task.utils';
// import { pipe } from 'fp-ts/lib/function';
// import type { DataProvider, GetListParams } from "react-admin";
// import { useQuery } from "react-query";
// import { type APIRESTClient } from '../../http';
// import { Queries, asQueries } from "../../providers/DataProvider";
// import { fetchQuery } from "./common";
// import { FetchQuery, type UseListQueryFn, type UseQueryFn } from "./type";

// export const getStoryQueryKey = (
//   p: Partial<GetListParams>,
//   discrete: boolean,
// ): [string, GetListParams, boolean] => {
//   return [
//     "stories",
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

// export const fetchStoryByPath = (dp: DataProvider,{
//   path,
// }: {
//   path: string;
// }): Promise<io.http.Story.Story> =>
//   pipe(
//     liftFetch(
//       () => dp.get("stories", { path }),
//       io.http.Common.ListOutput(io.http.Story.Story, "Stories").decode,
//     ),
//     fp.TE.map((pages) => pages.data[0]),
//     throwTE,
//   );

// export const fetchStories = (dp: APIRESTClient): FetchQuery<Queries['Story']['getList']> => fetchQuery(asQueries(dp).Story.getList);

// export const useStoriesQuery: UseListQueryFn<Story.Story> = (
//   dp,
//   params,
//   discrete,
// ) => {
//   return useQuery(getStoryQueryKey(params, discrete), fetchStories(dp));
// };

// export const useStoryByPathQuery: UseQueryFn<{ path: string }, Story.Story> = (dp, {
//   path,
// }) =>
//   useQuery(getStoryQueryKey({ filter: { path } }, false), async () => {
//     return await fetchStoryByPath(dp, { path });
//   });
