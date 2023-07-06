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
} from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { type Endpoint } from "@aws-sdk/types";
import * as logger from "@liexp/core/lib/logger";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import * as qs from "query-string";
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
  getEndpoint: (
    bucket: string,
    s?: string
  ) => TE.TaskEither<SpaceError, string>;
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
  ) => TE.TaskEither<
    SpaceError,
    CompleteMultipartUploadCommandOutput & { Location: string }
  >;
  getSignedUrl: (
    params: PutObjectCommandInput
  ) => TE.TaskEither<SpaceError, string>;
  deleteObject: (
    params: DeleteObjectCommandInput
  ) => TE.TaskEither<SpaceError, DeleteObjectCommandOutput>;
}

export type SpaceClientImpl = S3Client;

export interface MakeSpaceClientConfig {
  client: SpaceClientImpl;
}

export const MakeSpaceClient = ({
  client,
}: MakeSpaceClientConfig): SpaceClient => {
  return {
    getEndpoint: (bucket, path) => {
      return pipe(
        TE.tryCatch(
          () =>
            client.config.endpoint
              ? client.config.endpoint()
              : Promise.resolve(undefined),
          toError
        ),
        TE.filterOrElse(
          (e): e is Endpoint => !!e,
          () => toError(new Error("Can't get endpoint"))
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
        })
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
        input
      );
      const params = new PutObjectCommand({ ...input });
      return pipe(
        TE.tryCatch(() => getSignedUrl(client, params), toError),
        s3Logger.debug.logInTaskEither(`Get signed url %O`)
      );
    },
    upload(input) {
      return pipe(
        TE.tryCatch(async () => {
          const parallelUploads3 = new Upload({
            client,
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
        )
      );
    },
    getObject: (input: GetObjectCommandInput) => {
      s3Logger.debug.log(
        "Getting object from bucket %s at path %s",
        input.Bucket,
        input.Key
      );

      const params = new GetObjectCommand(input);
      return TE.tryCatch(() => client.send(params), toError);
    },

    deleteObject: (input) => {
      s3Logger.debug.log(
        "Deleting object from bucket %s at path %s",
        input.Bucket,
        input.Key
      );
      const params = new DeleteObjectCommand(input);
      return TE.tryCatch(() => client.send(params), toError);
    },
  };
};
