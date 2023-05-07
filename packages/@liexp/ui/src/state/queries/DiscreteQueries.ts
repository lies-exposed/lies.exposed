import { type GraphId } from '@liexp/shared/lib/endpoints/graph.endpoints';
import {
  type Events,
  type GroupMember,
  type Project,
} from "@liexp/shared/lib/io/http";
import { type APIError } from '@liexp/shared/lib/io/http/Error/APIError';
import type * as t from "io-ts";
import type { GetListParams, GetOneParams } from "react-admin";
import { useQuery, type UseQueryResult } from "react-query";
import { Queries, jsonData } from "../../providers/DataProvider";
import { fetchQuery } from "./common";
import { type FetchQuery, type UseListQueryFn } from "./type";

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

export const useGraphQuery = (id: GraphId): UseQueryResult<any, APIError> => {
  return useQuery(["graph", id], async () => {
    return await Queries.Graph.get(undefined, { id });
  });
};
