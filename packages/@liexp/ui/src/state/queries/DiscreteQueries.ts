import { Endpoints } from "@liexp/shared/lib/endpoints";
import { type Project } from "@liexp/shared/lib/io/http";
import { type APIError } from "@liexp/shared/lib/io/http/Error/APIError";
import {
  fromEndpoints,
  jsonData,
} from "@liexp/shared/lib/providers/EndpointsRESTClient/EndpointsRESTClient";
import { type APIRESTClient } from "@liexp/shared/lib/providers/api-rest.provider";
import type * as t from "io-ts";
import type { GetOneParams } from "react-admin";
import { useQuery, type UseQueryResult } from "react-query";

export const useProjectQuery = (
  dp: APIRESTClient,
  params: GetOneParams,
): UseQueryResult<Project.Project, any> => {
  return useQuery(["project", params.id], async () => {
    return await fromEndpoints(dp)(Endpoints).Project.get(params);
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
