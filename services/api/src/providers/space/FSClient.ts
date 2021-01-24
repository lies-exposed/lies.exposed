import * as fs from "fs";
import * as path from "path";
import { logger } from "@econnessione/core";
import * as AWS from "aws-sdk";
import * as IOE from "fp-ts/lib/IOEither";
import { Reader } from "fp-ts/lib/Reader";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { SpaceClient, toError } from "./SpaceClient";

const getFilePath = (
  basePath: string,
  params: AWS.S3.Types.GetObjectAclRequest
): string => path.join(basePath, params.Bucket, params.Key);

interface FSClientCtx {
  baseUrl: string;
  basePath: string;
  logger: logger.Logger;
}

const GetFSClient: Reader<FSClientCtx, SpaceClient> = (
  c: FSClientCtx
): SpaceClient => {
  return {
    getObject: (params) => {
      const filePath = getFilePath(c.basePath, params);
      c.logger.debug.log(`Getting file path %s`, filePath);
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
      const Location = getFilePath(c.basePath, params);

      c.logger.debug.log("Upload to %s", Location);
      if (!fs.existsSync(path.dirname(Location))) {
        c.logger.debug.log(
          "Directory %s doesn't exist, creating...",
          path.dirname(Location)
        );
        fs.mkdirSync(path.dirname(Location));
      }
      return pipe(
        IOE.tryCatch(
          () => fs.writeFileSync(Location, params.Body, { encoding: "utf-8" }),
          toError
        ),
        TE.fromIOEither,
        TE.map(() => ({
          Location: `${c.baseUrl}/${path.join(params.Bucket, params.Key)}`,
          ETag: "",
          Bucket: params.Bucket,
          Key: params.Key,
        }))
      );
    },
    getSignedUrl: (operation, params) => {
      return TE.right(
        `${c.baseUrl}/v1/uploads?Bucket=${params.Bucket}&key=${params.Key}`
      );
    },
    createBucket: (params) => {
      return TE.right({ Location: params.Bucket });
    },
  };
};

export { GetFSClient };
