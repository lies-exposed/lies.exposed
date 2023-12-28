import { type Area } from "@liexp/shared/lib/io/http/Area";
import type * as http from "@liexp/shared/lib/providers/api-rest.provider";
import { throwTE } from "@liexp/shared/lib/utils/task.utils";
import {
  type UpdateParams,
  type UpdateResult,
} from "@liexp/ui/lib/components/admin/react-admin";
import * as E from "fp-ts/Either";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";

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
      throwTE,
    );
  };
