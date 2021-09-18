import * as http from "@econnessione/shared/http";
import { Area } from "@econnessione/shared/io/http/Area";
import * as E from "fp-ts/lib/Either";
import * as T from "fp-ts/lib/Task";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { UpdateParams, UpdateResult } from "react-admin";

export const editArea =
  (client: http.APIRESTClient) =>
  (resource: string, params: UpdateParams): Promise<UpdateResult<Area>> => {
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
  };
