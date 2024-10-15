import { pipe } from "@liexp/core/lib/fp/index.js";
import { type APIError } from "@liexp/shared/lib/io/http/Error/APIError.js";
import { dataProviderRequestLift } from "@liexp/shared/lib/providers/EndpointsRESTClient/EndpointsRESTClient.js";
import { type APIRESTClient } from "@liexp/shared/lib/providers/api-rest.provider.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import type * as t from "io-ts";

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
      queryKey: ["json", id],
      queryFn: async () => {
        return jsonData(jsonClient)(decode)({ id });
      },
    });
  };
