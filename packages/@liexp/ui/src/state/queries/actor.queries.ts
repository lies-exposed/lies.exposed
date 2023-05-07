import { type Actor } from "@liexp/shared/lib/io/http";
import { type APIError } from '@liexp/shared/lib/io/http/Error/APIError';
import type { GetListParams, GetOneParams } from "react-admin";
import { useQuery, type UseQueryResult } from "react-query";
import { Queries } from "../../providers/DataProvider";
import { fetchQuery } from "./common";
import { type FetchQuery, type UseListQueryFn } from "./type";

export const defaultGetActorsQueryParams = {
  pagination: { page: 1, perPage: 40 },
  sort: { field: "id", order: "ASC" },
  filter: {},
};

export const getActorsQueryKey = (
  suffix: string,
  p: Partial<GetListParams>,
  discrete: boolean
): [string, GetListParams, boolean] => {
  return [
    `actors-${suffix}`,
    {
      filter: p.filter ? p.filter : {},
      pagination: {
        perPage: 20,
        page: 1,
        ...p.pagination,
      },
      sort: {
        order: "DESC",
        field: "fullName",
        ...p.sort,
      },
    },
    discrete,
  ];
};

export const fetchActors: FetchQuery<typeof Queries.Actor.getList> = fetchQuery(
  Queries.Actor.getList
);

export const useActorsQuery: UseListQueryFn<Actor.Actor> = (
  params,
  discrete,
  suffix = ""
) => {
  return useQuery(getActorsQueryKey(suffix, params, discrete), fetchActors);
};

export const getActorQueryKey = (p: GetOneParams): [string, GetOneParams] => {
  return ["actor", p];
};

export const fetchActor = async ({ queryKey }: any): Promise<Actor.Actor> =>
  await Queries.Actor.get({ id: queryKey[1].id });

export const useActorQuery = (
  params: GetOneParams
): UseQueryResult<Actor.Actor, APIError> => {
  return useQuery(getActorQueryKey(params), fetchActor);
};
