import { S3Client, type S3ClientConfig } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { type NODE_ENV } from "@liexp/core/lib/env/node-env.js";
import { type SPACE_ENV } from "../../io/ENV.js";
import { type MakeSpaceProviderConfig } from "./space.provider.js";

interface ENV extends SPACE_ENV {
  NODE_ENV: NODE_ENV;
}

export const createS3ProviderConfig = <E extends ENV>(
  env: E,
): MakeSpaceProviderConfig => {
  const config: S3ClientConfig =
    env.NODE_ENV === "development" || env.NODE_ENV === "test"
      ? {
          endpoint: `http://${env.SPACE_REGION}.${env.SPACE_ENDPOINT}`,
          region: env.SPACE_REGION,
          credentials: {
            accessKeyId: env.SPACE_ACCESS_KEY_ID,
            secretAccessKey: env.SPACE_ACCESS_KEY_SECRET,
          },
          tls: false,
          forcePathStyle: true,
        }
      : {
          endpoint: `https://${env.SPACE_REGION}.${env.SPACE_ENDPOINT}`,
          region: env.SPACE_REGION,
          credentials: {
            accessKeyId: env.SPACE_ACCESS_KEY_ID,
            secretAccessKey: env.SPACE_ACCESS_KEY_SECRET,
          },
          tls: true,
        };

  return {
    client: new S3Client(config),
    getSignedUrl,
    classes: { Upload },
  };
};
