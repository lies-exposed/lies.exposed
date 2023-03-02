import * as logger from "@liexp/core/logger";
import type * as AWS from "aws-sdk";
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
    params: AWS.S3.Types.CreateBucketRequest
  ) => TE.TaskEither<SpaceError, AWS.S3.CreateBucketOutput>;
  getObject: (
    params: AWS.S3.Types.GetObjectRequest
  ) => TE.TaskEither<SpaceError, AWS.S3.GetObjectOutput>;
  upload: (
    params: AWS.S3.Types.PutObjectRequest,
    opts?: AWS.S3.ManagedUpload.ManagedUploadOptions
  ) => TE.TaskEither<SpaceError, AWS.S3.ManagedUpload.SendData>;
  uploadMultipart: (
    params: AWS.S3.Types.CreateMultipartUploadRequest,
    stream: NodeJS.ReadableStream
  ) => TE.TaskEither<SpaceError, AWS.S3.Types.CreateMultipartUploadOutput>;
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
  createMultipartUpload: AWS.S3["createMultipartUpload"];
  completeMultipartUpload: AWS.S3["completeMultipartUpload"];
  uploadPart: AWS.S3["uploadPart"];
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
      return pipe(
        TE.tryCatch(
          () => config.client.getSignedUrlPromise(operation, params),
          toError
        ),
        s3Logger.debug.logInTaskEither(`Get signed url %O`)
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
    uploadMultipart(params, stream) {
      return pipe(
        TE.tryCatch(() => {
          return config.client.createMultipartUpload(params).promise();
        }, toError),
        TE.map((r) => r.UploadId),
        TE.filterOrElse(
          (id): id is string => id !== undefined,
          () => toError(new Error("Upload ID is missing"))
        ),
        TE.chain((id) => {
          const CHUNK_SIZE = 5000;

          return TE.tryCatch(() => {
            return new Promise<{ Parts: any[]; UploadId: string }>(
              (resolve, reject) => {
                let n = 0;
                const uploadPartResults: any[] = [];
                stream.on("data", (data) => {
                  s3Logger.debug.log('Chunk %d', n);
                  s3Logger.debug.log('Data %O', data);
                  void config.client
                    .uploadPart(
                      {
                        Key: params.Key,
                        Bucket: params.Bucket,
                        Body: data,
                        UploadId: id,
                        PartNumber: n,
                      },
                    )
                    .promise()
                    .then((rr) => {
                      uploadPartResults.push({
                        PartNumber: n,
                        ETag: rr.ETag,
                      });
                      n++;
                      stream.read(CHUNK_SIZE);
                    });
                });
                stream.on("error", reject);
                stream.on("end", () => {
                  resolve({
                    Parts: uploadPartResults,
                    UploadId: id,
                  });
                });

                stream.read(CHUNK_SIZE);
              }
            );
          }, toError);
        }),
        TE.chain(({ Parts, UploadId }) => {
          return TE.tryCatch(() => {
            return config.client
              .completeMultipartUpload({
                Key: params.Key,
                Bucket: params.Bucket,
                MultipartUpload: {
                  Parts,
                },
                UploadId,
              })
              .promise();
          }, toError);
        })
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
