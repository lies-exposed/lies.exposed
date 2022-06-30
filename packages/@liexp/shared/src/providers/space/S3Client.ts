import * as AWS from "aws-sdk";
import { Reader } from "fp-ts/lib/Reader";
import { MakeSpaceClient, SpaceClient } from "./SpaceClient";

type GetS3ClientConfig = AWS.S3.Types.ClientConfiguration;

const GetS3Client: Reader<GetS3ClientConfig, SpaceClient> = (config) =>
  MakeSpaceClient({
    client: new AWS.S3(config),
  });

export { GetS3Client };
