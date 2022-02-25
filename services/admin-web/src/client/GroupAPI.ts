import { Group } from "@liexp/shared/io/http/Group";
import { MediaType } from "@liexp/shared/io/http/Media";
import { APIRESTClient } from "@liexp/ui/http";
import * as E from "fp-ts/lib/Either";
import * as T from "fp-ts/lib/Task";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import {
  CreateParams,
  CreateResult,
  UpdateParams,
  UpdateResult,
} from "react-admin";
import { uploadImages } from "./MediaAPI";

export const createGroup =
  (client: APIRESTClient) =>
  (
    resource: string,
    params: CreateParams<any>
  ): Promise<CreateResult<Group>> => {
    const { avatar, ...data } = params.data;

    return pipe(
      TE.tryCatch(
        () => client.create<Group>(resource, { ...params, data: { ...data } }),
        E.toError
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
              E.toError
            )
          )
        );
      }),
      TE.fold(T.task.of, (result) => T.of(result as any))
    )();
  };

export const editGroup =
  (client: APIRESTClient) =>
  (
    resource: string,
    params: UpdateParams<Group>
  ): Promise<UpdateResult<Group>> => {
    const { avatar, ...data } = params.data;

    const avatarTask =
      typeof avatar === "string"
        ? TE.right([{ type: MediaType.types[0].value, location: avatar }])
        : uploadImages(client)(resource, data.id, [(avatar as any).rawFile]);

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
          E.toError
        )
      ),
      TE.fold(T.of, (result) => T.of(result as any))
    )();
  };
