import * as logger from "@econnessione/core/logger";
import { ControllerError } from "@io/ControllerError";
import type * as AWS from "aws-sdk";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";

const s3Logger = logger.GetLogger("space");

class SpaceError extends ControllerError {}

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
    params: AWS.S3.Types.CreateBucketRequest
  ) => TE.TaskEither<SpaceError, AWS.S3.CreateBucketOutput>;
  getObject: (
    params: AWS.S3.Types.GetObjectRequest
  ) => TE.TaskEither<SpaceError, AWS.S3.GetObjectOutput>;
  upload: (
    params: AWS.S3.Types.PutObjectRequest,
    opts?: AWS.S3.ManagedUpload.ManagedUploadOptions
  ) => TE.TaskEither<SpaceError, AWS.S3.ManagedUpload.SendData>;
  getSignedUrl: (
    operation: "putObject",
    params: AWS.S3.Types.PutObjectRequest
  ) => TE.TaskEither<SpaceError, string>;
  deleteObject: (
    params: AWS.S3.Types.DeleteObjectRequest
  ) => TE.TaskEither<SpaceError, AWS.S3.DeleteObjectOutput>;
}

export interface SpaceClientImpl {
  getObject: AWS.S3["getObject"];
  upload: AWS.S3["upload"];
  createBucket: AWS.S3["createBucket"];
  deleteObject: AWS.S3["deleteObject"];
  getSignedUrlPromise: AWS.S3["getSignedUrlPromise"];
}

export interface MakeSpaceClientConfig {
  client: SpaceClientImpl;
}

export const MakeSpaceClient = (config: MakeSpaceClientConfig): SpaceClient => {
  return {
    createBucket: (params: AWS.S3.Types.CreateBucketRequest) => {
      return TE.tryCatch(
        () => config.client.createBucket(params).promise(),
        toError
      );
    },
    getSignedUrl: (operation, params) => {
      s3Logger.debug.log(
        "GetSignedUrl object from bucket %s with params %O",
        operation,
        params
      );
      return TE.tryCatch(
        () => config.client.getSignedUrlPromise(operation, params),
        toError
      );
    },
    upload: (
      params: AWS.S3.Types.PutObjectRequest,
      opts?: AWS.S3.ManagedUpload.ManagedUploadOptions
    ) => {
      s3Logger.debug.log(
        "Uploading file in bucket %s at path %s",
        params.Bucket,
        params.Key
      );
      return pipe(
        TE.tryCatch(
          () => config.client.upload(params, opts).promise(),
          toError
        ),
        TE.map((result) => result)
      );
    },
    getObject: (params: AWS.S3.Types.GetObjectRequest) => {
      s3Logger.debug.log(
        "Getting object from bucket %s at path %s",
        params.Bucket,
        params.Key
      );
      return TE.tryCatch(
        () => config.client.getObject(params).promise(),
        toError
      );
    },

    deleteObject: (params: AWS.S3.Types.DeleteObjectRequest) => {
      s3Logger.debug.log(
        "Deleting object from bucket %s at path %s",
        params.Bucket,
        params.Key
      );
      return TE.tryCatch(
        () => config.client.deleteObject(params).promise(),
        toError
      );
    },
  };
};
