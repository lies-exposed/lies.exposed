import { type Area } from "@liexp/shared/io/http";
import type { GetListParams } from "react-admin";
import { useQuery } from "react-query";
import { Queries } from "../../providers/DataProvider";
import { fetchQuery } from "./common";
import { type FetchQuery, type UseListQueryFn, type UseQueryFn } from "./type";

export const getAreaQueryKey = (
  p: Partial<GetListParams>,
  discrete: boolean
): [string, GetListParams, boolean] => {
  return [
    "areas",
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
export const fetchAreas: FetchQuery<typeof Queries.Area.getList> = fetchQuery(
  Queries.Area.getList
);

export const useAreasQuery: UseListQueryFn<Area.Area> = (params, discrete) => {
  return useQuery(getAreaQueryKey(params, discrete), fetchAreas);
};

export const fetchArea = async ({ queryKey }: any): Promise<Area.Area> => {
  return await Queries.Area.get({ id: queryKey[1].id });
};

export const useAreaQuery: UseQueryFn<{ id: string }, Area.Area> = (params) => {
  return useQuery(["areas", params], fetchArea);
};
