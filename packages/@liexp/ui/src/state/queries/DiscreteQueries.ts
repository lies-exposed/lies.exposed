import { type GroupMember, type Project } from "@liexp/shared/lib/io/http";
import { type APIError } from "@liexp/shared/lib/io/http/Error/APIError";
import type * as t from "io-ts";
import type {  GetListParams, GetOneParams } from "react-admin";
import { useQuery, type UseQueryResult } from "react-query";
import { type APIRESTClient } from '../../http';
import { type Queries, asQueries, jsonData } from "../../providers/DataProvider";
import { fetchQuery } from "./common";
import { type FetchQuery } from "./type";

export const getGroupsMembersQueryKey = (
  p: Partial<GetListParams>,
  discrete: boolean,
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

export const fetchGroupsMembers: (dp:APIRESTClient) => FetchQuery<
  Queries['GroupMember']['getList']
> = (dp) => fetchQuery(asQueries(dp).GroupMember.getList);

export const useGroupMembersQuery = (
  dp: APIRESTClient,
  params: Partial<GetListParams>,
  discrete: boolean,
): UseQueryResult<
  { data: GroupMember.GroupMember[]; total: number },
  APIError
> => {
  return useQuery(
    getGroupsMembersQueryKey(params, discrete),
    fetchGroupsMembers(dp),
  );
};

export const useProjectQuery = (
  dp: APIRESTClient,
  params: GetOneParams,
): UseQueryResult<Project.Project, any> => {
  return useQuery(["project", params.id], async () => {
    return await asQueries(dp).Project.get(params);
  });
};

export const useJSONDataQuery = <A>(
  c: t.Decode<unknown, { data: A }>,
  id: string,
): UseQueryResult<{ data: A }, APIError> => {
  return useQuery(["json", id], async () => {
    return await jsonData(c)({ id });
  });
};
