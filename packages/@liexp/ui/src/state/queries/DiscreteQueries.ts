import { pipe } from "@liexp/core/lib/fp/index.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { type IOError } from "@ts-endpoint/core";
import {
  dataProviderRequestLift,
  type APIRESTClient,
} from "@ts-endpoint/react-admin";
import { type ParseError } from "effect/ParseResult";
import { type Either } from "fp-ts/lib/Either";

export const jsonData =
  (jsonClient: APIRESTClient) =>
  <A>(decode: (u: unknown) => Either<ParseError, { readonly data: A }>) =>
  ({ id }: { id: string }): Promise<{ data: A }> =>
    pipe(
      dataProviderRequestLift(() => jsonClient.get<any>(id, {}), decode),
      throwTE,
    );

export const useJSONDataQuery =
  (jsonClient: APIRESTClient) =>
  <A>(
    decode: (u: unknown) => Either<ParseError, { readonly data: A }>,
    id: string,
  ): UseQueryResult<{ data: A }, IOError | ParseError> => {
    return useQuery({
      // eslint-disable-next-line @tanstack/query/exhaustive-deps
      queryKey: ["json", id],
      queryFn: async () => {
        return jsonData(jsonClient)(decode)({ id });
      },
    });
  };
