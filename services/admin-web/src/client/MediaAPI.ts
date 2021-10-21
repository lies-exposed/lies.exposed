import * as qs from "querystring";
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
    resourceId: string
  ): TE.TaskEither<Error, { data: { url: string } }> => {
    return pipe(
      TE.tryCatch(
        () =>
          client.create<{ url: string }>("/uploads/getSignedURL", {
            data: {
              resource,
              resourceId,
              ContentType: "image/jpeg",
            },
          }),
        E.toError
      )
    );
  };

export const uploadFile =
  (client: http.APIRESTClient) =>
  (
    resource: string,
    resourceId: string,
    f: File
  ): TE.TaskEither<Error, string> => {
    return pipe(
      getSignedUrl(client)(resource, resourceId),
      TE.chain((url) => {
        const [location, search] = url.data.url.split("?");

        const headers = qs.parse(search);

        return pipe(
          TE.tryCatch(
            () =>
              axios.put(url.data.url, f, {
                headers: {
                  "Access-Control-Allow-Origin": "*",
                  "x-amz-acl": "public-read",
                  "Access-Control-Max-Age": "600",
                  ...headers,
                },
              }),
            E.toError
          ),
          TE.map(() => location)
        );
      })
    );
  };

export const uploadImages =
  (client: http.APIRESTClient) =>
  (
    resource: string,
    resourceId: string,
    files: File[]
  ): TE.TaskEither<Error, string[]> => {
    return pipe(
      files.map((file) => uploadFile(client)(resource, resourceId, file)),
      A.sequence(TE.ApplicativeSeq)
    );
  };
