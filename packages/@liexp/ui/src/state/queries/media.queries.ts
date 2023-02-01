import { type Media } from "@liexp/shared/io/http";
import type { GetListParams } from "react-admin";
import { useQuery, type UseQueryResult } from "react-query";
import { Queries } from "../../providers/DataProvider";
import { fetchQuery } from "./common";
import { type FetchQuery, type UseListQueryFn } from "./type";

export const getMediaQueryListKey = (
  p: Partial<GetListParams>,
  discrete: boolean
): [string, GetListParams, boolean] => {
  return [
    "media",
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

export const fetchMedia: FetchQuery<typeof Queries.Media.getList> = fetchQuery(
  Queries.Media.getList
);

export const useMediaQuery: UseListQueryFn<Media.Media> = (
  params,
  discrete
) => {
  return useQuery(getMediaQueryListKey(params, discrete), fetchMedia);
};

export const getMediaQueryKey = (id: string): any[] => ["media", { id }];
export const fetchSingleMedia = fetchQuery(Queries.Media.get);

export const useGetMediaQuery = (
  id: string
): UseQueryResult<Media.Media, any> => {
  return useQuery(getMediaQueryKey(id), fetchSingleMedia);
};
