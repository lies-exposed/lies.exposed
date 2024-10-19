import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { flow, fp, pipe } from "@liexp/core/lib/fp/index.js";
import {
  MediaExtraMonoid,
  type ThumbnailsExtra,
  ThumbnailsExtraMonoid,
} from "@liexp/shared/lib/io/http/Media/MediaExtra.js";
import { ImageType } from "@liexp/shared/lib/io/http/Media/MediaType.js";
import { type TaskEither } from "fp-ts/lib/TaskEither.js";
import { type Int } from "io-ts";
import { type CronJobTE } from "./cron-task.type.js";
import { type MediaEntity } from "#entities/Media.entity.js";
import { type TEReader } from "#flows/flow.types.js";
import { createThumbnail } from "#flows/media/thumbnails/createThumbnail.flow.js";
import ControllerErrorM, { type ControllerError } from "#io/ControllerError.js";
import { MediaRepository } from "#providers/db/entity-repository.provider.js";
import { fetchManyMedia } from "#queries/media/fetchManyMedia.query.js";
import { type RouteContext } from "#routes/route.types.js";

const createThumbnailTask =
  (m: MediaEntity): TEReader<MediaEntity> =>
  (ctx) => {
    return pipe(
      createThumbnail(m)(ctx),
      fp.TE.orElse(
        (e): TaskEither<ControllerError, ThumbnailsExtra["thumbnails"]> => {
          ctx.logger.debug.log(
            "Failed to generate thumbnail for %s: %s \n %s",
            m.id,
            e.details.kind,
            JSON.stringify(e.details),
          );
          return fp.TE.right({
            error: ControllerErrorM.report(e),
          });
        },
      ),
      fp.TE.map((thumbs) => ({
        thumbnail: Array.isArray(thumbs) ? thumbs[0] : null,
        extra: {
          ...ThumbnailsExtraMonoid.empty,
          ...MediaExtraMonoid.empty,
          ...m.extra,
          thumbnails: thumbs,
          needRegenerateThumbnail: !(
            Array.isArray(thumbs) && thumbs.length >= 1
          ),
        },
      })),

      fp.TE.map((updates) => {
        return { ...m, ...updates };
      }),
    );
  };

const convertManyMediaTask =
  (save: (a: MediaEntity[]) => TEReader<MediaEntity[]>) =>
  (locations: MediaEntity[]) => {
    return pipe(
      locations,
      fp.A.chunksOf(10),
      fp.A.map(
        flow(
          fp.A.traverse(fp.RTE.ApplicativePar)((m) =>
            pipe(
              createThumbnailTask(m),
              fp.RTE.chain((m) => save([m])),
            ),
          ),
          fp.RTE.map(fp.A.flatten),
        ),
      ),
      fp.A.sequence(fp.RTE.ApplicativeSeq),
      fp.RTE.map(fp.A.flatten),
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
export const regenerateMediaThumbnailJob: CronJobTE = (opts) => {
  return pipe(
    fp.RTE.Do,
    fp.RTE.bind("media", () =>
      pipe(
        fetchManyMedia({
          type: fp.O.some(ImageType.types.map((t) => t.value)),
          needRegenerateThumbnail: fp.O.some(true),
          hasExtraThumbnailsError: fp.O.some(false),
          _start: fp.O.some(0 as Int),
          _end: fp.O.some(50 as Int),
        }),
        LoggerService.RTE.debug((mm) => [
          "Regenerating %d thumbnails over %d media without thumbnail",
          mm[0].length,
          mm[1],
        ]),
        fp.RTE.map((mm) => {
          return mm[0];
        }),
        fp.RTE.chain(convertManyMediaTask((gg) => MediaRepository.save(gg))),
      ),
    ),
    fp.RTE.map(({ media }) => {
      return {
        media: media.length,
      };
    }),
    fp.RTE.matchE(
      () => (ctx) => {
        return fp.T.of(
          ctx.logger.error.log("Failed to regenerate media thumbnail"),
        );
      },
      ({ media }) =>
        (ctx) => {
          return fp.T.of(
            ctx.logger.info.log(
              "Regenerate %d media thumbnail successfully",
              media,
            ),
          );
        },
    ),
  );
};
