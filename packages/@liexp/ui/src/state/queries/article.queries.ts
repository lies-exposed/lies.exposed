import { type Article } from "@liexp/shared/lib/io/http";
import type { GetListParams } from "react-admin";
import { useQuery } from "react-query";
import { articleByPath, Queries } from "../../providers/DataProvider";
import { fetchQuery } from "./common";
import { type UseListQueryFn, type UseQueryFn } from "./type";

export const getArticleQueryKey = (
  p: Partial<GetListParams>,
  discrete: boolean
): [string, GetListParams, boolean] => {
  return [
    "articles",
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

export const fetchArticles = fetchQuery(Queries.Article.getList);

export const useArticlesQuery: UseListQueryFn<Article.Article> = (
  params,
  discrete
) => {
  return useQuery(getArticleQueryKey(params, discrete), fetchArticles);
};

export const useArticleByPathQuery: UseQueryFn<
  { path: string },
  Article.Article
> = ({ path }) =>
  useQuery(getArticleQueryKey({ filter: { path } }, false), async () => {
    return await articleByPath({ path });
  });
