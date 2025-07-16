import { type ENVContext } from "@liexp/backend/lib/context/env.context.js";
import { type LoggerContext } from "@liexp/backend/lib/context/logger.context.js";
import { type SpaceContext } from "@liexp/backend/lib/context/space.context.js";
import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type TaskEither } from "fp-ts/lib/TaskEither.js";
import { type ControllerError } from "../../io/ControllerError.js";

export const checkBucketOrCreate = <
  C extends ENVContext & SpaceContext & LoggerContext,
>(
  ctx: C,
): TaskEither<ControllerError, void> => {
  const bucketPolicy = {
    Version: "2012-10-17",
    Statement: [
      {
        Effect: "Allow",
        Principal: "*",
        Action: ["s3:GetObject"],
        Resource: [`arn:aws:s3:::${ctx.env.SPACE_BUCKET}/*`],
      },
    ],
  };

  return pipe(
    ctx.s3.getBucket(ctx.env.SPACE_BUCKET),
    fp.TE.chain(
      fp.O.fold(
        () =>
          pipe(
            ctx.s3.createBucket({
              Bucket: ctx.env.SPACE_BUCKET,
            }),
            LoggerService.TE.debug(ctx, `Bucket %O created`),
            fp.TE.map((output) => output.BucketArn),
          ),
        (bucket) => fp.TE.right(bucket.Name),
      ),
    ),
    LoggerService.TE.debug(ctx, `Bucket %s exists`),
    fp.TE.chainFirst((name) =>
      ctx.s3.putBucketPolicy({
        Bucket: name,
        Policy: JSON.stringify(bucketPolicy),
      }),
    ),

    fp.TE.map(() => undefined),
  );
};
