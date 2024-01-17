import { type Stats } from "@liexp/shared/lib/io/http/index.js";
import { useQuery } from "@tanstack/react-query";
import type { GetListParams } from "react-admin";
import { type UseQueryFn } from "./type.js";

export const getStatsQueryKey = (
  p: Partial<GetListParams>,
  discrete: boolean,
): [string, GetListParams, boolean] => {
  return [
    "stats",
    {
      filter: p.filter ?? {},
      pagination: {
        perPage: 20,
        page: 1,
        ...p.pagination,
      },
      sort: {
        field: "createdAt",
        order: "DESC",
        ...p.sort,
      },
    },
    discrete,
  ];
};

// export const fetchStats = async (params: any): Promise<Stats.Stats> => {
//   return await fetchQuery(Queries.Stats.getList)(params).then(
//     (results) => results.data[0],
//   );
// };

export const useStatsQuery: UseQueryFn<
  {
    id: string;
    type: string;
  },
  Stats.Stats
> = (params) => {
  return useQuery({
    queryKey: getStatsQueryKey(
      {
        filter: params,
      },
      false,
    ),
    queryFn: () => Promise.resolve(),
  });
};
