import { Area } from "@liexp/shared/io/http/Area";
import { throwTE } from "@liexp/shared/utils/task.utils";
import * as http from "@liexp/ui/http";
import * as E from "fp-ts/Either";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
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
      throwTE
    );
  };
