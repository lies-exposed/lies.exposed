import { S3Client, type S3ClientConfig } from "@aws-sdk/client-s3";
import { type Reader } from "fp-ts/Reader";
import { MakeSpaceClient, type SpaceClient } from "./SpaceClient";

type GetS3ClientConfig = S3ClientConfig;

const GetS3Client: Reader<GetS3ClientConfig, SpaceClient> = (config) =>
  MakeSpaceClient({
    client: new S3Client(config),
  });

export { GetS3Client };
