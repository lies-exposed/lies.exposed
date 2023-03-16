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
} from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import * as logger from "@liexp/core/logger";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { IOError } from "ts-io-error";

const s3Logger = logger.GetLogger("space");

class SpaceError extends IOError {}

export const toError = (e: unknown): SpaceError => {
  // eslint-disable-next-line
  s3Logger.error.log("Space Error %O", e);
  if (e instanceof Error) {
    return {
      name: "SpaceError",
      status: 500,
      message: e.message,
      details: {
        kind: "ServerError",
        status: "500",
        meta: e.stack,
      },
    };
  }
  return {
    name: "SpaceError",
    status: 500,
    message: "Internal Error",
    details: {
      kind: "ServerError",
      status: "500",
    },
  };
};

export interface SpaceClient {
  createBucket: (
    params: CreateBucketCommandInput
  ) => TE.TaskEither<SpaceError, CreateBucketCommandOutput>;
  getObject: (
    params: GetObjectCommandInput
  ) => TE.TaskEither<SpaceError, GetObjectCommandOutput>;
  // upload: (
  //   params: PutObjectCommandInput
  // ) => TE.TaskEither<SpaceError, PutObjectCommandOutput>;
  upload: (
    params: PutObjectCommandInput
  ) => TE.TaskEither<SpaceError, CompleteMultipartUploadCommandOutput & { Location: string }>;
  getSignedUrl: (
    params: GetObjectCommandInput
  ) => TE.TaskEither<SpaceError, string>;
  deleteObject: (
    params: DeleteObjectCommandInput
  ) => TE.TaskEither<SpaceError, DeleteObjectCommandOutput>;
}

export type SpaceClientImpl = S3Client;

export interface MakeSpaceClientConfig {
  client: SpaceClientImpl;
}

export const MakeSpaceClient = (config: MakeSpaceClientConfig): SpaceClient => {
  return {
    createBucket: (input: CreateBucketCommandInput) => {
      const params = new CreateBucketCommand(input);
      return TE.tryCatch(() => config.client.send(params), toError);
    },
    getSignedUrl: (input) => {
      s3Logger.debug.log(
        "GetSignedUrl object from bucket %s with params %O",
        input.Bucket,
        input
      );
      const params = new GetObjectCommand(input);
      return pipe(
        TE.tryCatch(() => getSignedUrl(config.client, params), toError),
        s3Logger.debug.logInTaskEither(`Get signed url %O`)
      );
    },
    // upload: (input: PutObjectCommandInput) => {
    //   s3Logger.debug.log(
    //     "Uploading file in bucket %s at path %s",
    //     input.Bucket,
    //     input.Key
    //   );
    //   const params = new PutObjectCommand(input);
    //   return pipe(
    //     TE.tryCatch(() => config.client.send(params), toError),
    //     TE.map((result) => result)
    //   );
    // },
    upload(input) {
      return pipe(
        TE.tryCatch(async () => {
          const parallelUploads3 = new Upload({
            client: config.client,
            params: { ...input },
            queueSize: 4, // optional concurrency configuration
            partSize: 1024 * 1024 * 5, // optional size of each part, in bytes, at least 5MB
            leavePartsOnError: false, // optional manually handle dropped parts
          });

          return await parallelUploads3.done();
        }, toError),
        TE.filterOrElse(
          (
            r: any
          ): r is Omit<CompleteMultipartUploadCommandOutput, "Location"> & {
            Location: string;
          } => r.Location !== undefined,
          () => toError(new Error(`Location is missing.`))
        ),
        TE.map((l: any) => ({
          ...l,
          Location: l.Location ? `https://${l.Location}` : undefined,
        }))
      );
    },
    getObject: (input: GetObjectCommandInput) => {
      s3Logger.debug.log(
        "Getting object from bucket %s at path %s",
        input.Bucket,
        input.Key
      );

      const params = new GetObjectCommand(input);
      return TE.tryCatch(() => config.client.send(params), toError);
    },

    deleteObject: (input) => {
      s3Logger.debug.log(
        "Deleting object from bucket %s at path %s",
        input.Bucket,
        input.Key
      );
      const params = new DeleteObjectCommand(input);
      return TE.tryCatch(() => config.client.send(params), toError);
    },
  };
};
