import { type Link } from "@liexp/shared/lib/io/http";
import type { GetListParams } from "react-admin";
import { type UseQueryResult, useQuery } from "react-query";
import { Queries } from "../../providers/DataProvider";
import { fetchQuery } from "./common";
import { type FetchQuery, type UseListQueryFn } from "./type";

export const defaultGetLinksQueryParams = {
  sort: {
    field: "createdAt",
    order: "DESC",
  },
  pagination: {
    perPage: 20,
    page: 1,
  },
  filter: {},
};

export const getLinksQueryKey = (
  p: Partial<GetListParams>,
  discrete: boolean,
): [string, GetListParams, boolean] => {
  return [
    "links",
    {
      filter: p.filter ? p.filter : {},
      pagination: {
        ...defaultGetLinksQueryParams.pagination,
        ...p.pagination,
      },
      sort: {
        ...defaultGetLinksQueryParams.sort,
        ...p.sort,
      },
    },
    discrete,
  ];
};
export const fetchLinks: FetchQuery<typeof Queries.Link.getList> = fetchQuery(
  Queries.Link.getList,
);

export const useLinksQuery: UseListQueryFn<Link.Link> = (params, discrete) => {
  return useQuery(getLinksQueryKey(params, discrete), fetchLinks);
};

export const getLinkQueryKey = (id: string): any[] => ["link", { id }];
export const fetchSingleLink = fetchQuery(Queries.Link.get);

export const useGetLinkQuery = (id: string): UseQueryResult<Link.Link, any> => {
  return useQuery(getLinkQueryKey(id), fetchSingleLink);
};
