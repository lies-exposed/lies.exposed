import * as qs from "query-string";
import { MP4Type, type MediaType } from "@liexp/shared/io/http/Media";
import axios from "axios";
import * as A from "fp-ts/Array";
import * as E from "fp-ts/Either";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { type DataProvider } from "react-admin";
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
    E.toError
  );

const getSignedUrl =
  (client: DataProvider) =>
  (
    resource: string,
    resourceId: string,
    ContentType: MediaType
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
        E.toError
      )
    );
  };

export const uploadFile =
  (client: DataProvider) =>
  (
    resource: string,
    resourceId: string,
    f: File,
    type: MediaType
  ): TE.TaskEither<Error, { type: MediaType; location: string }> => {
    const videoTask = pipe(
      TE.tryCatch(() => {
        const formData = new FormData();
        formData.append("resource", resource);
        formData.append("media", f);
        return apiProvider
          .request({
            method: 'PUT',
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
      }, E.toError)
    );

    const othersTask = pipe(
      getSignedUrl(client)(resource, resourceId, type),
      TE.chain((url) => {
        const [location, search] = url.data.url.split("?");

        const headers = qs.parse(search);

        return pipe(
          TE.tryCatch(
            () =>
              axios.put(url.data.url, f, {
                timeout: 600 * 1000,
                headers: {
                  "Content-Type": "multipart/form-data",
                  "Access-Control-Allow-Origin": "*",
                  "x-amz-acl": "public-read",
                  "Access-Control-Max-Age": "600",
                  ...headers,
                },
              }),
            E.toError
          ),
          TE.map(() => ({ type, location }))
        );
      })
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
    media: Array<{ type: MediaType; file: File }>
  ): TE.TaskEither<Error, Array<{ type: MediaType; location: string }>> => {
    return pipe(
      media.map((file) =>
        uploadFile(client)(resource, resourceId, file.file, file.type)
      ),
      A.sequence(TE.ApplicativeSeq)
    );
  };
