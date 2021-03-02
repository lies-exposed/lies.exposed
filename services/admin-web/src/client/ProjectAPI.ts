import * as http from "@econnessione/core/http";
import { Project } from "@econnessione/shared/io/http/Project";
import * as E from 'fp-ts/lib/Either';
import * as T from "fp-ts/lib/Task";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { CreateResult, UpdateParams } from "react-admin";
import { uploadImages } from "./MediaAPI";

export const editProject = (client: http.APIRESTClient) => (
  resource: string,
  params: UpdateParams
): Promise<CreateResult<Project>> => {
  const { newImages = [], images, newAreas, areas, ...data } = params.data;
  return pipe(
    uploadImages(client)(
      newImages
        .filter((i: any) => i !== undefined)
        .map((i: { location: { rawFile: File } }) => i.location),
      resource,
      params.id.toString()
    ),
    TE.chain((result) => {
      // eslint-disable-next-line
      console.log({ result });
      const updateParams = {
        ...params,
        data: {
          ...data,
          areas: newAreas.map((a: any) => ({
            ...a,
            geometry: JSON.parse(a.geometry),
          })),
          images: images.concat(
            result.map((l) => ({
              location: l,
              description: "",
            }))
          ),
        },
      };
      return TE.tryCatch(
        () => client.update<any>(resource, updateParams),
        E.toError
      );
    }),
    TE.fold(T.task.of, (result) => T.of(result as any))
  )();
};
