import type * as logger from "@liexp/core/logger";
import { type AxiosInstance, type AxiosResponse } from "axios";
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
          return client.get<unknown, AxiosResponse<Body>>(params.Key ?? "");
        }, toError),
        TE.chain((content) => TE.tryCatch(() => content.data.text(), toError)),
        TE.map((content) => ({ Body: content as any, $metadata: {} }))
      );
    },
    deleteObject: (params) => {
      return TE.right({ DeleteMarker: true, $metadata: {} });
    },
    upload: () => TE.right({ Location: "", $metadata: {} }),
    getSignedUrl: (params) => {
      logger.debug.log("getSignedURL with operation %s", params);
      return TE.right(
        `${client.defaults.baseURL?.replace("data", "localhost")}/public/${
          params.Key
        }?Content-Type=multipart/form-data;boundary=---test-boundary`
      );
    },
    createBucket: (params) => {
      return TE.right({ Location: params.Bucket, $metadata: {} });
    },
  };
};

export { GetLocalSpaceClient };
