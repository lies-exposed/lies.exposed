import * as fs from "fs";
import * as path from "path";
import * as logger from "@econnessione/core/logger";
import * as IOE from "fp-ts/lib/IOEither";
import { Reader } from "fp-ts/lib/Reader";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { SpaceClient, toError } from "./SpaceClient";

// const getFilePath = (
//   basePath: string,
//   params: AWS.S3.Types.GetObjectAclRequest
// ): string => path.join(basePath, params.Key);

interface FSClientCtx {
  baseUrl: string;
  basePath: string;
  dataFolder: string;
  logger: logger.Logger;
}

const GetFSClient: Reader<FSClientCtx, SpaceClient> = ({
  logger: serverLogger,
  ...c
}: FSClientCtx): SpaceClient => {
  const logger = serverLogger.extend("FSClient");
  logger.debug.log("Started FS Client %O", c);
  return {
    getObject: (params) => {
      const filePath = path.resolve(c.dataFolder, params.Key);
      logger.debug.log(`Getting file path %s`, filePath);
      return pipe(
        IOE.tryCatch(
          () =>
            fs.readFileSync(filePath, {
              encoding: "utf-8",
            }),
          toError
        ),
        TE.fromIOEither,
        TE.map((content) => ({ Body: content }))
      );
    },
    deleteObject: (params) => {
      return TE.right({ DeleteMarker: true });
    },
    upload: (params) => {
      logger.debug.log("Upload with params %O", params);
      const Location = params.Key;

      const fileDir = path.dirname(path.join(c.basePath, Location));
      const filePath = path.join(c.basePath, Location);
      logger.debug.log("Saving file at %s", filePath);
      logger.debug.log("Check dir %s exists", fileDir);
      if (!fs.existsSync(fileDir)) {
        logger.debug.log("Directory %s doesn't exist, creating...", fileDir);
        fs.mkdirSync(fileDir, { recursive: true });
      }
      return pipe(
        IOE.tryCatch(
          () => fs.writeFileSync(filePath, params.Body, { encoding: "utf-8" }),
          toError
        ),
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
      const signedPath = path.join(c.dataFolder, params.Key);
      const signedUrl = `${c.baseUrl}/v1/uploads/${signedPath}`;
      logger.debug.log("Signed path %s, url (%s)", signedPath, signedUrl);
      return TE.right(signedUrl);
    },
    createBucket: (params) => {
      return TE.right({ Location: params.Bucket });
    },
  };
};

export { GetFSClient };
