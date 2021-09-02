import * as logger from "@econnessione/core/logger";
import axios from "axios";
import * as IOE from "fp-ts/lib/IOEither";
import { Reader } from "fp-ts/lib/Reader";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { SpaceClient, toError } from "./SpaceClient";

interface LocalSpaceClientCtx {
  baseUrl: string;
  logger: logger.Logger;
}

const GetLocalSpaceClient: Reader<LocalSpaceClientCtx, SpaceClient> = ({
  logger: serverLogger,
  ...c
}: LocalSpaceClientCtx): SpaceClient => {
  const logger = serverLogger.extend("FSClient");
  logger.debug.log("Started FS Client %O", c);
  const httpClient = axios.create({
    baseURL: c.baseUrl,
    responseType: "text",
  });

  return {
    getObject: (params) => {
      logger.debug.log(`Getting file path %s/%s`, params.Bucket, params.Key);
      return pipe(
        TE.tryCatch(() => {
          return httpClient.get(`/${params.Bucket}/${params.Key}`);
        }, toError),
        TE.map((content) => ({ Body: content.data }))
      );
    },
    deleteObject: (params) => {
      return TE.right({ DeleteMarker: true });
    },
    upload: (params) => {
      logger.debug.log("Upload with params %O", params);
      const Location = params.Key;

      return pipe(
        IOE.tryCatch(() => {}, toError),
        TE.fromIOEither,
        TE.map(() => ({
          Location: `${c.baseUrl}${Location.replace("/v1/uploads/", "/")}`,
          ETag: "",
          Bucket: params.Bucket,
          Key: params.Key,
        }))
      );
    },
    getSignedUrl: (operation, params) => {
      logger.debug.log("getSignedURL with operation %s", operation);
      return TE.right("signed-url");
    },
    createBucket: (params) => {
      return TE.right({ Location: params.Bucket });
    },
  };
};

export { GetLocalSpaceClient };
