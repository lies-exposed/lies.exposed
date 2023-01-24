import * as AWS from "aws-sdk";
import { type Reader } from "fp-ts/Reader";
import { MakeSpaceClient, type SpaceClient } from "./SpaceClient";

type GetS3ClientConfig = AWS.S3.Types.ClientConfiguration;

const GetS3Client: Reader<GetS3ClientConfig, SpaceClient> = (config) =>
  MakeSpaceClient({
    client: new AWS.S3(config),
  });

export { GetS3Client };
