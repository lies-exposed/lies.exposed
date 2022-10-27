import { Project } from "@liexp/shared/io/http/Project";
import { throwTE } from "@liexp/shared/utils/task.utils";
import { uploadImages } from "@liexp/ui/client/admin/MediaAPI";
import * as http from "@liexp/ui/http";
import { sequenceS } from "fp-ts/Apply";
import * as A from "fp-ts/Array";
import * as E from "fp-ts/Either";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { CreateParams, CreateResult, UpdateParams } from "react-admin";

export const editProject =
  (client: http.APIRESTClient) =>
  (resource: string, params: UpdateParams): Promise<CreateResult<Project>> => {
    const {
      newImages = [],
      images,
      newAreas = [],
      areas,
      ...data
    } = params.data;
    const imageFiles: any[] = newImages.filter((i: any) => i !== undefined);

    return pipe(
      sequenceS(TE.taskEither)({
        newImageFiles: TE.right(imageFiles),
        uploadLocations: uploadImages(client)(
          resource,
          params.id.toString(),
          newImages.map(
            (i: { location: { rawFile: File } }) => i.location.rawFile
          )
        ),
      }),
      TE.chain(({ newImageFiles, uploadLocations }) => {
        const imageData = A.zipWith(
          newImageFiles,
          uploadLocations,
          ({ description, kind }, u) => ({
            description,
            kind,
            location: u,
          })
        );

        const updateParams = {
          ...params,
          data: {
            ...data,
            areas: newAreas
              .map((a: any) => ({
                ...a,
                geometry: JSON.parse(a.geometry),
              }))
              .concat(areas),
            media: imageData.concat(images),
          },
        };
        return TE.tryCatch(
          () => client.update<any>(resource, updateParams),
          E.toError
        );
      }),
      throwTE
    );
  };

export const createProject =
  (client: http.APIRESTClient) =>
  (resource: string, params: CreateParams): Promise<CreateResult<Project>> => {
    const images = params.data.images ? params.data.images : [];
    const createParams: CreateParams = {
      ...params,
      data: {
        ...params.data,
        areas: params.data.areas.map((g: any) => ({
          ...g,
          geometry: JSON.parse(g.geometry),
        })),
        images,
      },
    };

    return pipe(
      TE.tryCatch(
        () => client.create<Project>(resource, createParams),
        E.toError
      ),
      throwTE
    );
  };
