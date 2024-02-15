import { Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { type APIError } from "@liexp/shared/lib/io/http/Error/APIError.js";
import { type Project } from "@liexp/shared/lib/io/http/index.js";
import {
  fromEndpoints,
  jsonData,
} from "@liexp/shared/lib/providers/EndpointsRESTClient/EndpointsRESTClient.js";
import { type APIRESTClient } from "@liexp/shared/lib/providers/api-rest.provider.js";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import type * as t from "io-ts";
import type { GetOneParams } from "react-admin";

export const useProjectQuery = (
  dp: APIRESTClient,
  params: GetOneParams,
): UseQueryResult<Project.Project, any> => {
  return useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: ["project", params.id],
    queryFn: async () => {
      return await fromEndpoints(dp)(Endpoints).Endpoints.Project.get(params);
    },
  });
};

export const useJSONDataQuery = <A>(
  c: t.Decode<unknown, { data: A }>,
  id: string,
): UseQueryResult<{ data: A }, APIError> => {
  return useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: ["json", id],
    queryFn: async () => {
      return await jsonData(c)({ id });
    },
  });
};
