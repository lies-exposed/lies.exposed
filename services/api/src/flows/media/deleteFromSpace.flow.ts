import { getMediaKeyFromLocation } from "@liexp/shared/utils/media.utils";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { sequenceS } from "fp-ts/lib/Apply";
import { type MediaEntity } from "@entities/Media.entity";
import { type ControllerError } from "@io/ControllerError";
import { type RouteContext } from "@routes/route.types";

export const deleteFromSpace =
  (ctx: RouteContext) =>
  (m: MediaEntity): TE.TaskEither<ControllerError, MediaEntity> => {
    ctx.logger.debug.log("Create media and upload %s", m.location);

    const isLocationInBucket = m.location.includes(ctx.env.SPACE_BUCKET);
    const isThumbnailInBucket = m.thumbnail?.includes(ctx.env.SPACE_BUCKET);

    return pipe(
      sequenceS(TE.ApplicativePar)({
        thumbnail: isThumbnailInBucket
          ? ctx.s3.deleteObject({
              Bucket: ctx.env.SPACE_BUCKET,
              Key: getMediaKeyFromLocation(m.location),
            })
          : TE.right(undefined),
        location:
          isLocationInBucket && m.thumbnail
            ? ctx.s3.deleteObject({
                Bucket: ctx.env.SPACE_BUCKET,
                Key: getMediaKeyFromLocation(m.thumbnail),
              })
            : TE.right(undefined),
      }),
      ctx.logger.debug.logInTaskEither("Result %O"),
      // TE.chain(({ location, thumbnail }) =>
      //   ctx.db.delete(MediaEntity, [m.id])
      // ),
      TE.map(() => m)
    );
  };
