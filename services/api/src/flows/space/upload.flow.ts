import {
  type CompleteMultipartUploadCommandOutput,
  type PutObjectCommandInput,
} from "@aws-sdk/client-s3";
import { type TEReader } from "#flows/flow.types.js";

export const upload =
  (
    thumbnail: Omit<PutObjectCommandInput, "Bucket"> & { Bucket?: string },
  ): TEReader<CompleteMultipartUploadCommandOutput & { Location: string }> =>
  (ctx) => {
    return ctx.s3.upload({
      Bucket: ctx.env.SPACE_BUCKET,
      ...thumbnail,
      ACL: "public-read",
    });
  };
