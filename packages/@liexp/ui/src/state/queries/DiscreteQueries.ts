import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { type APIError } from "@liexp/shared/lib/io/http/Error/APIError.js";
import { type Project } from "@liexp/shared/lib/io/http/index.js";
import {
  dataProviderRequestLift,
  fromEndpoints,
} from "@liexp/shared/lib/providers/EndpointsRESTClient/EndpointsRESTClient.js";
import { type APIRESTClient } from "@liexp/shared/lib/providers/api-rest.provider.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils";
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
      return fromEndpoints(dp)(Endpoints).Endpoints.Project.get(params);
    },
  });
};

export const jsonData =
  (jsonClient: APIRESTClient) =>
  <A>(decode: t.Decode<unknown, { data: A }>) =>
  ({ id }: { id: string }): Promise<{ data: A }> =>
    pipe(
      dataProviderRequestLift(() => jsonClient.get<any>(id, {}), decode),
      throwTE,
    );

export const useJSONDataQuery =
  (jsonClient: APIRESTClient) =>
  <A>(
    decode: t.Decode<unknown, { data: A }>,
    id: string,
  ): UseQueryResult<{ data: A }, APIError> => {
    return useQuery({
      // eslint-disable-next-line @tanstack/query/exhaustive-deps
      queryKey: ["json", id],
      queryFn: async () => {
        return jsonData(jsonClient)(decode)({ id });
      },
    });
  };
