import { parseURL } from "@liexp/shared/lib/helpers/media";
import { MP4Type, type MediaType } from "@liexp/shared/lib/io/http/Media";
import { throwTE } from "@liexp/shared/lib/utils/task.utils";
import axios from "axios";
import * as A from "fp-ts/Array";
import * as E from "fp-ts/Either";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { type DataProvider, type RaRecord } from "react-admin";
import { durationToSeconds } from "../../components/admin/media/DurationField";
import { apiProvider } from "../api";

export interface RawMedia {
  location: {
    rawFile: File;
  };
  type: MediaType;
}

export const convertFileToBase64 = (file: File): TE.TaskEither<Error, string> =>
  TE.tryCatch(
    () =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve(reader.result as string);
        };
        reader.onerror = reject;

        reader.readAsDataURL(file);
      }),
    E.toError,
  );

const getSignedUrl =
  (client: DataProvider) =>
  (
    resource: string,
    resourceId: string,
    ContentType: MediaType,
  ): TE.TaskEither<Error, { data: { url: string } }> => {
    return pipe(
      TE.tryCatch(
        () =>
          client.create<{ id: string; url: string }>("/uploads/getSignedURL", {
            data: {
              resource,
              resourceId,
              ContentType,
            },
          }),
        E.toError,
      ),
    );
  };

export const uploadFile =
  (client: DataProvider) =>
  (
    resource: string,
    resourceId: string,
    f: File,
    type: MediaType,
  ): TE.TaskEither<Error, { type: MediaType; location: string }> => {
    const videoTask = pipe(
      TE.tryCatch(async () => {
        const formData = new FormData();
        formData.append("resource", resource);
        formData.append("media", f);
        return await apiProvider
          .request({
            method: "PUT",
            url: `/uploads-multipart/${resourceId}`,
            data: formData,
            timeout: 600 * 1000,
            headers: {
              "Content-Type": "multipart/form-data",
            },
          })
          .then((response) => {
            return {
              type,
              location: response.data.Location,
            };
          });
      }, E.toError),
    );

    const othersTask = pipe(
      getSignedUrl(client)(resource, resourceId, type),
      TE.chain((url) => {
        const [location] = url.data.url.split("?");

        return pipe(
          TE.tryCatch(
            () =>
              axios.put(url.data.url, f, {
                timeout: 600 * 1000,
                headers: {
                  "Content-Type": f.type,
                  "Access-Control-Allow-Origin": "*",
                  "x-amz-acl": "public-read",
                  "Access-Control-Max-Age": "600",
                  // ...headers,
                },
              }),
            E.toError,
          ),
          TE.map(() => ({ type, location })),
        );
      }),
    );

    if (MP4Type.is(type)) {
      return videoTask;
    }
    return othersTask;
  };

export const uploadImages =
  (client: DataProvider) =>
  (
    resource: string,
    resourceId: string,
    media: Array<{ type: MediaType; file: File }>,
  ): TE.TaskEither<Error, Array<{ type: MediaType; location: string }>> => {
    return pipe(
      media.map((file) =>
        uploadFile(client)(resource, resourceId, file.file, file.type),
      ),
      A.sequence(TE.ApplicativeSeq),
    );
  };

export const transformMedia =
  (apiProvider: DataProvider<string>) =>
  async (data: RaRecord): Promise<RaRecord> => {
    const uploadFileTask =
      data._type === "fromFile" && data.location.rawFile
        ? uploadFile(apiProvider)(
            "media",
            data.id.toString(),
            data.location.rawFile,
            data.location.rawFile.type,
          )
        : data._type === "fromURL" && data.url
          ? TE.fromEither(parseURL(data.url))
          : TE.right({ type: data.type, location: data.location });

    const events = (data.events ?? []).concat(data.newEvents ?? []);
    const links = (data.links ?? []).concat(
      (data.newLinks ?? []).flatMap((l: any) => l.ids),
    );
    const keywords = (data.keywords ?? []).concat(data.newKeywords ?? []);
    const areas = (data.areas ?? []).concat(data.newAreas ?? []);
    const extra = data.extra
      ? {
          ...data.extra,
          duration: data.extra.duration
            ? typeof data.extra.duration === "string"
              ? durationToSeconds(data.extra.duration)
              : typeof data.extra.duration === "number"
                ? data.extra.duration
                : undefined
            : undefined,
        }
      : undefined;
    return await pipe(
      uploadFileTask,
      TE.map((media) => ({
        ...data,
        id: data.id.toString(),
        ...media,
        label: data.label ?? data.description,
        extra,
        events,
        links,
        keywords,
        areas,
      })),
      throwTE,
    );
  };
