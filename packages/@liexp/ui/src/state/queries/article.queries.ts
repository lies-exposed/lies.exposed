import { type Story } from "@liexp/shared/lib/io/http";
import type { GetListParams } from "react-admin";
import { useQuery } from "react-query";
import { fetchStoryByPath, Queries } from "../../providers/DataProvider";
import { fetchQuery } from "./common";
import { type UseListQueryFn, type UseQueryFn } from "./type";

export const getStoryQueryKey = (
  p: Partial<GetListParams>,
  discrete: boolean,
): [string, GetListParams, boolean] => {
  return [
    "stories",
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

export const fetchStories = fetchQuery(Queries.Story.getList);

export const useStoriesQuery: UseListQueryFn<Story.Story> = (
  params,
  discrete,
) => {
  return useQuery(getStoryQueryKey(params, discrete), fetchStories);
};

export const useStoryByPathQuery: UseQueryFn<{ path: string }, Story.Story> = ({
  path,
}) =>
  useQuery(getStoryQueryKey({ filter: { path } }, false), async () => {
    return await fetchStoryByPath({ path });
  });
