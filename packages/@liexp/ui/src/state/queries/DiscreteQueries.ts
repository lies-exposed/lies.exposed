import { Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { type APIError } from "@liexp/shared/lib/io/http/Error/APIError.js";
import { type Project } from "@liexp/shared/lib/io/http/index.js";
import {
  fromEndpoints,
  jsonData,
} from "@liexp/shared/lib/providers/EndpointsRESTClient/EndpointsRESTClient.js";
import { type APIRESTClient } from "@liexp/shared/lib/providers/api-rest.provider.js";
import type * as t from "io-ts";
import type { GetOneParams } from "react-admin";
import { useQuery, type UseQueryResult } from "react-query";

export const useProjectQuery = (
  dp: APIRESTClient,
  params: GetOneParams,
): UseQueryResult<Project.Project, any> => {
  return useQuery({
    queryKey: ["project", params.id],
    queryFn: async () => {
      return await fromEndpoints(dp)(Endpoints).Project.get(params);
    },
  });
};

export const useJSONDataQuery = <A>(
  c: t.Decode<unknown, { data: A }>,
  id: string,
): UseQueryResult<{ data: A }, APIError> => {
  return useQuery({
    queryKey: ["json", id],
    queryFn: async () => {
      return await jsonData(c)({ id });
    },
  });
};
