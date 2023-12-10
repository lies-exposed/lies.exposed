import { type S3ClientConfig } from "@aws-sdk/client-s3";
import {
  S3Provider,
  type SpaceProvider,
} from "@liexp/backend/lib/providers/space/index.js";
import { type ENV } from "#io/ENV.js";

export const createS3Provider = (env: ENV): SpaceProvider.SpaceProvider => {
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

  return S3Provider.GetS3Provider(config);
};
