import { pipe } from "@liexp/core/lib/fp/index.js";
import { getMediaKeyFromLocation } from "@liexp/shared/lib/utils/media.utils.js";
import { sequenceS } from "fp-ts/lib/Apply.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { type MediaEntity } from "#entities/Media.entity.js";
import { type TEReader } from "#flows/flow.types.js";
import { LoggerService } from "#flows/logger/logger.service.js";

export const deleteFromSpace =
  (m: MediaEntity): TEReader<MediaEntity> =>
  (ctx) => {
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
      LoggerService.TE.debug(ctx, "Result %O"),
      // TE.chain(({ location, thumbnail }) =>
      //   ctx.db.delete(MediaEntity, [m.id])
      // ),
      TE.map(() => m),
    );
  };
