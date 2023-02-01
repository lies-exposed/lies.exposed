import {
  type Events,
  type GroupMember, type Project
} from "@liexp/shared/io/http";
import {
  type GetNetworkParams,
  type GetNetworkQuery
} from "@liexp/shared/io/http/Network";
import { type APIError } from "@liexp/shared/providers/http/http.provider";
import type * as t from "io-ts";
import type { GetListParams, GetOneParams } from "react-admin";
import { useQuery, type UseQueryResult } from "react-query";
import { type serializedType } from "ts-io-error/lib/Codec";
import {
  jsonData,
  Queries
} from "../../providers/DataProvider";
import { fetchQuery } from "./common";
import { type FetchQuery, type UseListQueryFn, type UseQueryFn } from "./type";

export const getEventsQueryKey = (
  p: Partial<GetListParams>,
  discrete: boolean
): [string, GetListParams, boolean] => {
  return [
    "events",
    {
      filter: p.filter ?? {},
      pagination: {
        perPage: 20,
        page: 1,
        ...p.pagination,
      },
      sort: {
        order: "DESC",
        field: "date",
        ...p.sort,
      },
    },
    discrete,
  ];
};

export const fetchEvents: (a: any) => Promise<any> = fetchQuery(
  Queries.Event.getList
);

export const useEventsQuery: UseListQueryFn<Events.Event> = (
  params,
  discrete
) => {
  return useQuery(getEventsQueryKey(params, discrete), fetchEvents);
};



// export const fetchActorsDiscreteQuery = async ({
//   queryKey,
// }: any): Promise<Actor.Actor[]> => {
//   const params = queryKey[1];
//   return R.isEmpty(params.filter) || params.filter.ids?.length === 0
//     ? await emptyQuery()
//     : await Queries.Actor.getList(params);
// };

// export const useActorsDiscreteQuery = (
//   params: Partial<GetListParams>
// ): UseQueryResult<{ data: Actor.Actor[]; total: number }, APIError> => {
//   return useQuery(getActorsQueryKey(params, true), fetchActorsDiscreteQuery);
// };




export const getGroupsMembersQueryKey = (
  p: Partial<GetListParams>,
  discrete: boolean
): [string, GetListParams, boolean] => {
  return [
    "groups-members",
    {
      filter: p.filter ? p.filter : {},
      pagination: {
        perPage: 20,
        page: 1,
        ...p.pagination,
      },
      sort: {
        order: "DESC",
        field: "updatedAt",
        ...p.sort,
      },
    },
    discrete,
  ];
};

export const fetchGroupsMembers: FetchQuery<
  typeof Queries.GroupMember.getList
> = fetchQuery(Queries.GroupMember.getList);

export const useGroupMembersQuery = (
  params: Partial<GetListParams>,
  discrete: boolean
): UseQueryResult<
  { data: GroupMember.GroupMember[]; total: number },
  APIError
> => {
  return useQuery(
    getGroupsMembersQueryKey(params, discrete),
    fetchGroupsMembers
  );
};

export const useProjectQuery = (
  params: GetOneParams
): UseQueryResult<Project.Project, any> => {
  return useQuery(["project", params.id], async () => {
    return await Queries.Project.get(params);
  });
};

export const useJSONDataQuery = <A>(
  c: t.Decode<unknown, { data: A }>,
  id: string
): UseQueryResult<{ data: A }, APIError> => {
  return useQuery(["json", id], async () => {
    return await jsonData(c)({ id });
  });
};

export const useGraphQuery = (id: string): UseQueryResult<any, APIError> => {
  return useQuery(["graph", id], async () => {
    return await Queries.Graph.get({ id });
  });
};


export const getStatsQueryKey = (
  p: Partial<GetListParams>,
  discrete: boolean
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

export const fetchStats = async (params: any): Promise<any> => {
  return await fetchQuery(Queries.Stats.getList)(params).then(
    (results) => results.data[0]
  );
};

export const useStatsQuery: UseQueryFn<
  {
    id: string;
    type: string;
  },
  any
> = (params) => {
  return useQuery(
    getStatsQueryKey(
      {
        filter: params,
      },
      false
    ),
    fetchStats
  );
};

export const fetchNetworkGraph: FetchQuery<any> = fetchQuery(
  Queries.Networks.get
);

export const useNetworkGraphQuery = (
  params: GetNetworkParams,
  query: Partial<serializedType<typeof GetNetworkQuery>>
): UseQueryResult<any, APIError> => {
  return useQuery(
    [
      `network-${params.type}-${params.id}`,
      {
        ...params,
        pagination: {
          perPage: 1,
          page: 1,
        },
        sort: {
          order: "DESC",
          field: "date",
        },
        ...query,
        emptyRelations: query.emptyRelations ?? undefined,
      },
    ],
    fetchNetworkGraph
  );
};
