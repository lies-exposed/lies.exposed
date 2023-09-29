import { S3Client, type S3ClientConfig } from "@aws-sdk/client-s3";
import { type Reader } from "fp-ts/Reader";
import { MakeSpaceProvider, type SpaceProvider } from "./space.provider";

type GetS3ProviderConfig = S3ClientConfig;

const GetS3Provider: Reader<GetS3ProviderConfig, SpaceProvider> = (config) =>
  MakeSpaceProvider({
    client: new S3Client(config),
  });

export { GetS3Provider };
