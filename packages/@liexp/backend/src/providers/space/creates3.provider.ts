import { type S3ClientConfig } from "@aws-sdk/client-s3";
import { type NODE_ENV } from "@liexp/core/lib/env/node-env.js";
import { GetS3Provider } from "./s3.provider.js";
import { type SpaceProvider } from "./space.provider.js";

interface ENV {
  NODE_ENV: NODE_ENV;
  SPACE_REGION: string;
  SPACE_ENDPOINT: string;
  SPACE_ACCESS_KEY_ID: string;
  SPACE_ACCESS_KEY_SECRET: string;
}

export const createS3Provider = <E extends ENV>(env: E): SpaceProvider => {
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

  return GetS3Provider(config);
};
