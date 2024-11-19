import {
  type CompleteMultipartUploadCommandOutput,
  CreateBucketCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  type CreateBucketCommandInput,
  type CreateBucketCommandOutput,
  type DeleteObjectCommandInput,
  type DeleteObjectCommandOutput,
  type GetObjectCommandInput,
  type GetObjectCommandOutput,
  type PutObjectCommandInput,
  type S3Client,
  PutObjectCommand,
  ListObjectsCommand,
  type ListObjectsCommandInput,
  type ListObjectsCommandOutput,
} from "@aws-sdk/client-s3";
import { type Upload } from "@aws-sdk/lib-storage";
import { type getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { type Endpoint } from "@aws-sdk/types";
import * as logger from "@liexp/core/lib/logger/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { pipe } from "fp-ts/lib/function.js";
import * as qs from "query-string";
import { IOError } from "ts-io-error";

const s3Logger = logger.GetLogger("space");

export class SpaceError extends IOError {
  name = "SpaceError";
}

export const toError = (e: unknown): SpaceError => {
  if (e instanceof SpaceError) {
    return e;
  }

  s3Logger.error.log("Space Error %O", e);
  if (e instanceof Error) {
    return new SpaceError(e.message, {
      kind: "ServerError",
      status: "500",
      meta: e.stack,
    });
  }

  return new SpaceError("Internal Error", {
    kind: "ServerError",
    status: "500",
    meta: [String(e)],
  });
};

export interface SpaceProvider {
  getEndpoint: (
    bucket: string,
    s?: string,
  ) => TE.TaskEither<SpaceError, string>;
  createBucket: (
    params: CreateBucketCommandInput,
  ) => TE.TaskEither<SpaceError, CreateBucketCommandOutput>;
  getObject: (
    params: GetObjectCommandInput,
  ) => TE.TaskEither<SpaceError, GetObjectCommandOutput>;
  listObjects: (
    input: ListObjectsCommandInput,
  ) => TE.TaskEither<SpaceError, ListObjectsCommandOutput>;
  // upload: (
  //   params: PutObjectCommandInput
  // ) => TE.TaskEither<SpaceError, PutObjectCommandOutput>;
  upload: (
    params: PutObjectCommandInput,
  ) => TE.TaskEither<
    SpaceError,
    CompleteMultipartUploadCommandOutput & { Location: string }
  >;
  getSignedUrl: (
    params: PutObjectCommandInput,
  ) => TE.TaskEither<SpaceError, string>;
  deleteObject: (
    params: DeleteObjectCommandInput,
  ) => TE.TaskEither<SpaceError, DeleteObjectCommandOutput>;
}

export type SpaceProviderImpl = S3Client;

export interface MakeSpaceProviderConfig {
  client: SpaceProviderImpl;
  getSignedUrl: typeof getSignedUrl;
  classes: {
    Upload: typeof Upload;
  };
}

export const MakeSpaceProvider = ({
  client,
  getSignedUrl,
  classes,
}: MakeSpaceProviderConfig): SpaceProvider => {
  return {
    getEndpoint: (bucket, path) => {
      return pipe(
        TE.tryCatch(
          () =>
            client.config.endpoint
              ? client.config.endpoint()
              : Promise.resolve(undefined),
          toError,
        ),
        TE.filterOrElse(
          (e): e is Endpoint => !!e,
          () => toError(new Error("Can't get endpoint")),
        ),
        TE.map((e) => {
          let endpointURL = `${e.protocol}//${bucket}.${e.hostname}`;
          if (e.port) {
            endpointURL += `:${e.port}`;
          }
          endpointURL += `${e.path}`;
          if (path) {
            endpointURL += path;
          }

          if (e.query) {
            endpointURL += `?${qs.stringify(e.query)}`;
          }
          return endpointURL;
        }),
      );
    },
    createBucket: (input: CreateBucketCommandInput) => {
      const params = new CreateBucketCommand(input);
      return TE.tryCatch(() => client.send(params), toError);
    },
    getSignedUrl: (input) => {
      s3Logger.debug.log(
        "GetSignedUrl object from bucket %s with params %O",
        input.Bucket,
        input,
      );
      const params = new PutObjectCommand({ ...input });
      return pipe(
        TE.tryCatch(() => getSignedUrl(client, params), toError),
        TE.chainFirst(() =>
          TE.fromIO(() => s3Logger.debug.log(`Get signed url %O`)),
        ),
      );
    },
    upload(input) {
      return pipe(
        TE.tryCatch(async () => {
          const parallelUploads3 = new classes.Upload({
            client,
            params: { ...input },
            queueSize: 4, // optional concurrency configuration
            partSize: 1024 * 1024 * 5, // optional size of each part, in bytes, at least 5MB
            leavePartsOnError: false, // optional manually handle dropped parts
          });
          const result = await parallelUploads3.done();
          return result;
        }, toError),
        TE.filterOrElse(
          (
            r: any,
          ): r is Omit<CompleteMultipartUploadCommandOutput, "Location"> & {
            Location: string;
          } => r.Location !== undefined,
          () => toError(new Error(`Location is missing.`)),
        ),
      );
    },
    getObject: (input: GetObjectCommandInput) => {
      s3Logger.debug.log(
        "Getting object from bucket %s at path %s",
        input.Bucket,
        input.Key,
      );

      const params = new GetObjectCommand(input);
      return TE.tryCatch(() => client.send(params), toError);
    },
    listObjects: (input: ListObjectsCommandInput) => {
      const params = new ListObjectsCommand(input);
      return TE.tryCatch(() => client.send(params), toError);
    },

    deleteObject: (input) => {
      s3Logger.debug.log(
        "Deleting object from bucket %s at path %s",
        input.Bucket,
        input.Key,
      );
      const params = new DeleteObjectCommand(input);
      return TE.tryCatch(() => client.send(params), toError);
    },
  };
};
