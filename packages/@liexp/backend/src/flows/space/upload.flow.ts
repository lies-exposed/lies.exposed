import {
  type CompleteMultipartUploadCommandOutput,
  type PutObjectCommandInput,
} from "@aws-sdk/client-s3";
import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import { pipe } from "fp-ts/lib/function.js";
import { type ENVContext } from "../../context/env.context.js";
import { type SpaceContext } from "../../context/space.context.js";
import { type SpaceError } from "../../providers/space/space.provider.js";

export const upload =
  <C extends SpaceContext & ENVContext>(
    input: Omit<PutObjectCommandInput, "Bucket"> & { Bucket?: string },
  ): ReaderTaskEither<
    C,
    SpaceError,
    CompleteMultipartUploadCommandOutput & { Location: string }
  > =>
  (ctx) => {
    return pipe(
      ctx.s3.upload({
        Bucket: ctx.env.SPACE_BUCKET,
        ...input,
        ACL: "public-read",
      }),
    );
  };
