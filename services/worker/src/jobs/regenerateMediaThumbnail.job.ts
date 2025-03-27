import { type MediaEntity } from "@liexp/backend/lib/entities/Media.entity.js";
import { createThumbnail } from "@liexp/backend/lib/flows/media/thumbnails/createThumbnail.flow.js";
import { fetchManyMedia } from "@liexp/backend/lib/queries/media/fetchManyMedia.query.js";
import { MediaRepository } from "@liexp/backend/lib/services/entity-repository.service.js";
import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { flow, fp, pipe } from "@liexp/core/lib/fp/index.js";
import {
  MediaExtraMonoid,
  type ThumbnailsExtra,
  ThumbnailsExtraMonoid,
} from "@liexp/shared/lib/io/http/Media/MediaExtra.js";
import { ImageType } from "@liexp/shared/lib/io/http/Media/MediaType.js";
import * as O from "effect/Option";
import { type TaskEither } from "fp-ts/lib/TaskEither.js";
import { type Int } from "io-ts";
import { type RTE } from "../types.js";
import { type CronJobTE } from "./cron-task.type.js";
import { type WorkerContext } from "#context/context.js";
import * as WorkerError from "#io/worker.error.js";

const createThumbnailTask =
  (m: MediaEntity): RTE<MediaEntity> =>
  (ctx) => {
    return pipe(
      createThumbnail(m)(ctx),
      fp.TE.orElse(
        (
          e,
        ): TaskEither<
          WorkerError.WorkerError,
          ThumbnailsExtra["thumbnails"]
        > => {
          ctx.logger.debug.log(
            "Failed to generate thumbnail for %s: %s \n %s",
            m.id,
            e.details.kind,
            JSON.stringify(e.details),
          );
          return fp.TE.right({
            error: WorkerError.report(e),
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
  (save: (a: MediaEntity[]) => RTE<MediaEntity[]>) =>
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
 * @param ctx - application context {@link ServerContext}
 * @param args - command arguments
 * @returns void
 */
export const regenerateMediaThumbnailJob: CronJobTE = (opts) => {
  return pipe(
    fp.RTE.Do,
    fp.RTE.bind("media", () =>
      pipe(
        fetchManyMedia<WorkerContext>({
          type: O.some(ImageType.members.map((t) => t.Type)),
          needRegenerateThumbnail: O.some(true),
          hasExtraThumbnailsError: O.some(false),
          _start: O.some(0 as Int),
          _end: O.some(50 as Int),
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
