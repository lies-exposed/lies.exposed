import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import type * as logger from "@liexp/core/lib/logger/index.js";
import { type AxiosInstance, type AxiosResponse } from "axios";
import { type Reader } from "fp-ts/lib/Reader.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { type SpaceProvider, toError } from "./space.provider.js";

interface LocalSpaceProviderCtx {
  client: AxiosInstance;
  logger: logger.Logger;
}

const GetLocalSpaceProvider: Reader<LocalSpaceProviderCtx, SpaceProvider> = ({
  logger: serverLogger,
  client,
}: LocalSpaceProviderCtx): SpaceProvider => {
  const logger = serverLogger.extend("local-space-client");

  return {
    getEndpoint: () => {
      return pipe(
        fp.IOE.tryCatch(() => {
          const fileImport = /file:\/{2,3}(.+)\/[^/]/.exec(import.meta.url);
          if (fileImport?.[1]) {
            return `${process.platform === "win32" ? "" : "/"}${fileImport[1]}`;
          }
          throw new Error(`Could not find file path from ${import.meta.url}`);
        }, toError),
        TE.fromIOEither,
      );
    },
    getObject: (params) => {
      return pipe(
        TE.tryCatch(() => {
          logger.debug.log(`Getting file path %s`, params.Key);
          return client.get<unknown, AxiosResponse<Body>>(params.Key ?? "");
        }, toError),
        TE.chain((content) => TE.tryCatch(() => content.data.text(), toError)),
        TE.map((content) => ({ Body: content as any, $metadata: {} })),
      );
    },
    deleteObject: (params) => {
      return TE.right({ DeleteMarker: true, $metadata: {} });
    },
    upload: () => TE.right({ Location: "", $metadata: {} }),
    listObjects: () => TE.right({ Contents: [], $metadata: {} }),
    getSignedUrl: (params) => {
      logger.debug.log("getSignedURL with operation %s", params);
      return TE.right(
        `${client.defaults.baseURL?.replace("data", "localhost")}/public/${
          params.Key
        }?Content-Type=multipart/form-data;boundary=---test-boundary`,
      );
    },
    createBucket: (params) => {
      return TE.right({ Location: params.Bucket, $metadata: {} });
    },
  };
};

export { GetLocalSpaceProvider };
