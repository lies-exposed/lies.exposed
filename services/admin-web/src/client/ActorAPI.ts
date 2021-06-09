import { APIRESTClient } from "@econnessione/core/http";
import { Actor } from "@econnessione/shared/io/http/Actor";
import * as E from "fp-ts/lib/Either";
import * as T from "fp-ts/lib/Task";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import {
  CreateParams,
  CreateResult,
  UpdateParams,
  UpdateResult,
} from "react-admin";
import { uploadImages } from "./MediaAPI";

export const createActor =
  (client: APIRESTClient) =>
  (
    resource: string,
    params: CreateParams<any>
  ): Promise<CreateResult<Actor>> => {
    const { avatar, ...data } = params.data;

    return pipe(
      TE.tryCatch(
        () => client.create<Actor>(resource, { ...params, data: { ...data } }),
        E.toError
      ),
      TE.chain((result) => {
        const avatarTask =
          typeof avatar === "string"
            ? TE.right([avatar])
            : uploadImages(client)(resource, result.data.id, [avatar]);

        return pipe(
          avatarTask,
          TE.chain(([location]) =>
            TE.tryCatch(
              () =>
                client.update<Actor>(resource, {
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

export const editActor =
  (client: APIRESTClient) =>
  (
    resource: string,
    params: UpdateParams<any>
  ): Promise<UpdateResult<Actor>> => {
    const { avatar, ...data } = params.data;

    const avatarTask =
      typeof avatar === "string"
        ? TE.right([avatar])
        : uploadImages(client)(resource, data.id, [avatar.rawFile]);

    return pipe(
      avatarTask,
      TE.chain(([location]) =>
        TE.tryCatch(
          () =>
            client.update<Actor>(resource, {
              id: data.id,
              previousData: data,
              data: {
                ...data,
                avatar: location,
              },
            }),
          E.toError
        )
      ),
      TE.fold(T.task.of, (result) => T.of(result as any))
    )();
  };
