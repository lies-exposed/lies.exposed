import { type Area } from "@liexp/shared/lib/io/http/Area.js";
import type * as http from "@liexp/shared/lib/providers/api-rest.provider.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import {
  type UpdateParams,
  type UpdateResult,
} from "@liexp/ui/lib/components/admin/react-admin.js";
import * as E from "fp-ts/lib/Either.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { pipe } from "fp-ts/lib/function.js";

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
