import { getMediaKeyFromLocation } from "@liexp/shared/lib/utils/media.utils";
import { sequenceS } from "fp-ts/Apply";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { type MediaEntity } from "@entities/Media.entity";
import { type TEFlow } from "@flows/flow.types";

export const deleteFromSpace: TEFlow<[MediaEntity], MediaEntity> =
  (ctx) => (m) => {
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
      TE.map(() => m),
    );
  };
