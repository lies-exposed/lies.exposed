// export const getPageContentByPathQueryKey = (p: { path: string }): any[] => [
//   "pages",
//   p,
// ];

// export const fetchPageContentByPath = async ({
//   queryKey,
// }: any): Promise<Page.Page> => {
//   const path = queryKey[1].path;
//   return await pipe(
//     fp.TE.tryCatch(
//       () =>
//         Queries.Page.getList({
//           pagination: {
//             page: 1,
//             perPage: 1,
//           },
//           filter: {
//             path,
//           },
//           sort: { field: "createdAt", order: "DESC" },
//         }),
//       (e) => e as APIError,
//     ),
//     fp.TE.map((pages) => fp.A.head(pages.data)),
//     fp.TE.chain(
//       fp.TE.fromOption(
//         (): APIError => ({
//           name: `APIError`,
//           message: `Page ${path} is missing`,
//           details: [],
//         }),
//       ),
//     ),
//     throwTE,
//   );
// };

// export const usePageContentByPathQuery: UseQueryFn<
//   { path: string },
//   Page.Page
// > = ({ path }) =>
//   useQuery(getPageContentByPathQueryKey({ path }), fetchPageContentByPath);
