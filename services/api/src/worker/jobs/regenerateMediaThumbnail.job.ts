import { flow, fp, pipe } from "@liexp/core/lib/fp/index.js";
import {
  MediaExtraMonoid,
  ThumbnailsExtraMonoid,
} from "@liexp/shared/lib/io/http/Media/MediaExtra.js";
import { ImageType } from "@liexp/shared/lib/io/http/Media/MediaType.js";
import { type Int } from "io-ts";
import { type CronJobTE } from "./cron-task.type.js";
import { MediaEntity } from "#entities/Media.entity.js";
import { createThumbnail } from "#flows/media/thumbnails/createThumbnail.flow.js";
import { type ControllerError } from "#io/ControllerError.js";
import { fetchManyMedia } from "#queries/media/fetchManyMedia.query.js";
import { type RouteContext } from "#routes/route.types.js";
import { type TEControllerError } from "#types/TEControllerError.js";

const createThumbnailTask =
  (ctx: RouteContext) =>
  (m: MediaEntity): TEControllerError<MediaEntity> => {
    return pipe(
      createThumbnail(ctx)(m),
      fp.TE.orElse((e) => {
        ctx.logger.debug.log(
          "Failed to generate thumbnail for %s: %s \n %s",
          m.id,
          e.details.kind,
          JSON.stringify(e.details),
        );
        return fp.TE.right<ControllerError, string[]>([]);
      }),
      fp.TE.map((thumbs) => ({
        thumbnail: thumbs[0],
        extra: {
          ...ThumbnailsExtraMonoid.empty,
          ...MediaExtraMonoid.empty,
          ...m.extra,
          needRegenerateThumbnail: thumbs.length === 0,
        },
      })),

      fp.TE.map((updates) => {
        return { ...m, ...updates };
      }),
    );
  };

const convertManyMediaTask =
  (ctx: RouteContext) =>
  (save: (a: MediaEntity[]) => TEControllerError<MediaEntity[]>) =>
  (locations: MediaEntity[]) => {
    ctx.logger.debug.log("Regenerate thumbnail for %d media", locations.length);
    return pipe(
      locations,
      fp.A.chunksOf(10),
      fp.A.map(
        flow(
          fp.A.traverse(fp.TE.ApplicativePar)(
            flow(
              createThumbnailTask(ctx),
              fp.TE.chain((m) => save([m])),
            ),
          ),
          fp.TE.map(fp.A.flatten),
        ),
      ),
      fp.A.sequence(fp.TE.ApplicativeSeq),
      fp.TE.map(fp.A.flatten),
    );
  };

/**
 * Usage regenerate-media-thumbnail [--all]
 *
 * $search      text used as query for wikipedia search api
 * @param ctx - application context {@link RouteContext}
 * @param args - command arguments
 * @returns void
 */
export const regenerateMediaThumbnailJob: CronJobTE = (ctx) => (opts) => {
  return pipe(
    fp.TE.Do,
    fp.TE.bind("media", () =>
      pipe(
        fetchManyMedia(ctx)({
          type: fp.O.some(ImageType.types.map((t) => t.value)),
          needRegenerateThumbnail: fp.O.some(true),
          _start: fp.O.some(0 as Int),
          _end: fp.O.some(50 as Int),
        }),
        fp.TE.chain((mm) =>
          convertManyMediaTask(ctx)((gg) => ctx.db.save(MediaEntity, gg))(
            mm[0],
          ),
        ),
      ),
    ),
    fp.TE.map(({ media }) => {
      return {
        media: media.length,
      };
    }),
    ctx.logger.debug.logInTaskEither("regenerateMediaThumbnail"),
    fp.TE.matchE(
      () => {
        return fp.T.of(
          ctx.logger.error.log("Failed to regenerate media thumbnail"),
        );
      },
      () => {
        return fp.T.of(
          ctx.logger.info.log("Regenerate media thumbnail successfully"),
        );
      },
    ),
  );
};
