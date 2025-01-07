import { pipe } from "@liexp/core/lib/fp/index.js";
import { getMediaKeyFromLocation } from "@liexp/shared/lib/utils/media.utils.js";
import { sequenceS } from "fp-ts/lib/Apply.js";
import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { type ENVContext } from "../../context/env.context.js";
import { type LoggerContext } from "../../context/logger.context.js";
import { type SpaceContext } from "../../context/space.context.js";
import { type MediaEntity } from "../../entities/Media.entity.js";
import { type SpaceError } from "../../providers/space/space.provider.js";
import { LoggerService } from "../../services/logger/logger.service.js";

export const deleteFromSpace =
  <C extends LoggerContext & SpaceContext & ENVContext>(
    m: MediaEntity,
  ): ReaderTaskEither<C, SpaceError, MediaEntity> =>
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
