import { http } from "@econnessione/core";
import axios from "axios";
import * as A from "fp-ts/lib/Array";
import * as E from "fp-ts/lib/Either";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { CreateResult } from "react-admin";

const getSignedUrl = (client: http.APIRESTClient) => (
  key: string,
  bucket: string
): TE.TaskEither<Error, CreateResult<string>> => {
  return pipe(
    TE.tryCatch(
      () =>
        client.create("/uploads/getSignedURL", {
          data: {
            Key: key,
            Bucket: bucket,
            ContentType: 'image/jpeg'
          },
        }),
      E.toError
    )
  );
};

const uploadFile = (client: http.APIRESTClient) => (
  resource: string,
  resourceId: string,
  f: File
): TE.TaskEither<Error, string> => {
  return pipe(
    getSignedUrl(client)(resourceId, resource),
    TE.chain((url) => {
      // eslint-disable-next-line
      const data = new FormData();
      data.append("file", f, f.name);
      data.append("resource", resource);
      data.append("resourceId", resourceId);
      return pipe(
        TE.tryCatch(
          () =>
            axios.post(url.data, data, {
              headers: {
                "Content-Type": `multipart/form-data;`,
              },
            }),
          E.toError
        ),
        TE.map((result) => {
          // eslint-disable-next-line no-console
          console.log(result);
          return result.data.body.data.Location;
        })
      );
    })
  );
};

export const uploadImages = (client: http.APIRESTClient) => (
  locations: string[],
  resource: string,
  resourceId: string
): TE.TaskEither<Error, string[]> => {
  return pipe(
    locations.map((n: any) => uploadFile(client)(resource, resourceId, n.rawFile)),
    A.sequence(TE.taskEitherSeq)
  );
};
