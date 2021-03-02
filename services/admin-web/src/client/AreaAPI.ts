import * as http from "@econnessione/core/http";
import { Area } from "@econnessione/shared/io/http/Area";
import * as E from "fp-ts/lib/Either";
import * as T from "fp-ts/lib/Task";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { GetOneResult, UpdateParams, UpdateResult } from "react-admin";

export const editArea = (client: http.APIRESTClient) => (
  resource: string,
  params: UpdateParams
): Promise<UpdateResult<Area>> => {
  if (resource === "areas") {
    const updateParams: UpdateParams = {
      ...params,
      data: {
        ...params.data,
        geometry: JSON.parse(params.data.geometry),
      },
    };

    return pipe(
      TE.tryCatch(() => client.update<Area>(resource, updateParams), E.toError),
      TE.fold(T.task.of, (result) => T.of(result as any))
    )();
  }

  return client.update(resource, params);
};
