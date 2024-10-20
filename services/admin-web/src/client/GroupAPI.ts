import { type Group } from "@liexp/shared/lib/io/http/Group.js";
import { MediaType } from "@liexp/shared/lib/io/http/Media/index.js";
import { type APIRESTClient } from "@liexp/shared/lib/providers/api-rest.provider.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import { uploadImages } from "@liexp/ui/lib/client/admin/MediaAPI.js";
import {
  type CreateParams,
  type CreateResult,
  type UpdateParams,
  type UpdateResult,
} from "@liexp/ui/lib/components/admin/react-admin.js";
import * as E from "fp-ts/lib/Either.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { pipe } from "fp-ts/lib/function.js";

export const createGroup =
  (client: APIRESTClient) =>
  (
    resource: string,
    params: CreateParams<any>,
  ): Promise<CreateResult<Group>> => {
    const { avatar, ...data } = params.data;

    return pipe(
      TE.tryCatch(
        () => client.create<Group>(resource, { ...params, data: { ...data } }),
        E.toError,
      ),
      TE.chain((result) => {
        const avatarTask =
          typeof avatar === "string"
            ? TE.right([{ type: MediaType.types[0].value, location: avatar }])
            : uploadImages(client)(resource, result.data.id, [avatar]);

        return pipe(
          avatarTask,
          TE.chain(([{ location }]) =>
            TE.tryCatch(
              () =>
                client.update<Group>(resource, {
                  id: result.data.id,
                  previousData: result.data,
                  data: {
                    ...result,
                    avatar: location,
                  },
                }),
              E.toError,
            ),
          ),
        );
      }),
      throwTE,
    );
  };

export const editGroup =
  (client: APIRESTClient) =>
  (
    resource: string,
    params: UpdateParams<Group>,
  ): Promise<UpdateResult<Group>> => {
    const { avatar, ...data } = params.data;

    const avatarTask =
      typeof avatar === "string"
        ? TE.right([{ type: MediaType.types[0].value, location: avatar }])
        : data.id
          ? uploadImages(client)(resource, data.id, [(avatar as any).rawFile])
          : TE.left(new Error("No avatar to upload"));

    return pipe(
      avatarTask,
      TE.chain(([{ type, location }]) =>
        TE.tryCatch(
          () =>
            client.update<Group>(resource, {
              id: params.id,
              previousData: params.previousData,
              data: {
                ...params.data,
                avatar: location,
              },
            }),
          E.toError,
        ),
      ),
      throwTE,
    );
  };
