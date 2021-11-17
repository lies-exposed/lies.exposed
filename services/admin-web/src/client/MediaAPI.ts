import * as qs from "querystring";
import { MediaType } from "@econnessione/shared/io/http/Media";
import * as http from "@econnessione/ui/http";
import axios from "axios";
import * as A from "fp-ts/lib/Array";
import * as E from "fp-ts/lib/Either";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";

export const convertFileToBase64 = (file: File): TE.TaskEither<Error, string> =>
  TE.tryCatch(
    () =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;

        reader.readAsDataURL(file);
      }),
    E.toError
  );

const getSignedUrl =
  (client: http.APIRESTClient) =>
  (
    resource: string,
    resourceId: string,
    ContentType: MediaType
  ): TE.TaskEither<Error, { data: { url: string } }> => {
    return pipe(
      TE.tryCatch(
        () =>
          client.create<{ url: string }>("/uploads/getSignedURL", {
            data: {
              resource,
              resourceId,
              ContentType,
            },
          }),
        E.toError
      )
      // TE.map(({ data: { url } }) => {
      //   const realURL = url.replace("space:9000", "localhost:9000");
      //   console.log({ url, realURL });
      //   return { data: { url: realURL } };
      // })
    );
  };

export const uploadFile =
  (client: http.APIRESTClient) =>
  (
    resource: string,
    resourceId: string,
    f: File,
    type: MediaType
  ): TE.TaskEither<Error, { type: MediaType; location: string }> => {
    return pipe(
      getSignedUrl(client)(resource, resourceId, type),
      TE.chain((url) => {
        const [location, search] = url.data.url.split("?");

        const headers = qs.parse(search);

        console.log(headers);
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
  };

export const uploadImages =
  (client: http.APIRESTClient) =>
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
