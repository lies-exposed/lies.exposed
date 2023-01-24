import * as path from "path";
import type * as logger from "@liexp/core/logger";
import { type Body } from "aws-sdk/clients/s3";
import { type AxiosInstance, type AxiosResponse } from "axios";
import FormData from "form-data";
import { type Reader } from "fp-ts/Reader";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { type SpaceClient, toError } from "./SpaceClient";

interface LocalSpaceClientCtx {
  client: AxiosInstance;
  logger: logger.Logger;
}

const GetLocalSpaceClient: Reader<LocalSpaceClientCtx, SpaceClient> = ({
  logger: serverLogger,
  client,
}: LocalSpaceClientCtx): SpaceClient => {
  const logger = serverLogger.extend("local-space-client");

  return {
    getObject: (params) => {
      return pipe(
        TE.tryCatch(() => {
          logger.debug.log(`Getting file path %s`, params.Key);
          return client.get<unknown, AxiosResponse<Body>>(params.Key);
        }, toError),
        TE.map((content) => ({ Body: content.data }))
      );
    },
    deleteObject: (params) => {
      return TE.right({ DeleteMarker: true });
    },
    upload: (params) => {
      // logger.debug.log("Upload with params %O", params);

      const data = new FormData();
      data.append("file", params.Body, path.basename(params.Key));

      return pipe(
        TE.tryCatch(
          () =>
            client.post<
              FormData,
              AxiosResponse<{ data: { Location: string } }>
            >(params.Key, data, {
              headers: data.getHeaders(),
            }),
          toError
        ),
        TE.map((data) => {
          return {
            Location: data.data.data.Location,
            ETag: "",
            Bucket: params.Bucket,
            Key: params.Key,
          };
        })
      );
    },
    getSignedUrl: (operation, params) => {
      logger.debug.log("getSignedURL with operation %s", operation);
      return TE.right(
        `${client.defaults.baseURL?.replace("data", "localhost")}/public/${
          params.Key
        }?Content-Type=multipart/form-data;boundary=---test-boundary`
      );
    },
    createBucket: (params) => {
      return TE.right({ Location: params.Bucket });
    },
  };
};

export { GetLocalSpaceClient };
