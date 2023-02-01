import { type Link } from "@liexp/shared/io/http";
import type { GetListParams } from "react-admin";
import { useQuery } from "react-query";
import { Queries } from "../../providers/DataProvider";
import { fetchQuery } from "./common";
import { type FetchQuery, type UseListQueryFn } from "./type";

export const getLinkQueryKey = (
  p: Partial<GetListParams>,
  discrete: boolean
): [string, GetListParams, boolean] => {
  return [
    "links",
    {
      filter: p.filter ? p.filter : {},
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
export const fetchLinks: FetchQuery<typeof Queries.Link.getList> = fetchQuery(
  Queries.Link.getList
);

export const useLinksQuery: UseListQueryFn<Link.Link> = (params, discrete) => {
  return useQuery(getLinkQueryKey(params, discrete), fetchLinks);
};
