import { S3Client, type S3ClientConfig } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { type Reader } from "fp-ts/lib/Reader.js";
import { MakeSpaceProvider, type SpaceProvider } from "./space.provider.js";

type GetS3ProviderConfig = S3ClientConfig;

const GetS3Provider: Reader<GetS3ProviderConfig, SpaceProvider> = (config) =>
  MakeSpaceProvider({
    client: new S3Client(config),
    getSignedUrl,
    classes: { Upload },
  });

export { GetS3Provider };
