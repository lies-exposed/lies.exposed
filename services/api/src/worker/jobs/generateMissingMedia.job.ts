import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { ImageMediaExtraMonoid } from "@liexp/shared/lib/io/http/Media/MediaExtra.js";
import { ensureHTTPS } from "@liexp/shared/lib/utils/media.utils.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import Cron from "node-cron";
import { type ServerContext } from "#context/context.type.js";
import { type MediaEntity } from "#entities/Media.entity.js";
import { getMediaWithoutThumbnailsFlow } from "#flows/admin/media/getMediaAdminStats.flow.js";
import { createThumbnail } from "#flows/media/thumbnails/createThumbnail.flow.js";
import {
  type ControllerError,
  toControllerError,
} from "#io/ControllerError.js";
import { MediaRepository } from "#providers/db/entity-repository.provider.js";

export const generateMissingThumbnailsCron = (
  ctx: ServerContext,
): Cron.ScheduledTask =>
  Cron.schedule(
    ctx.env.GENERATE_MISSING_THUMBNAILS_CRON,
    (opts) => {
      void pipe(
        fp.TE.Do,
        fp.TE.bind("media", () => getMediaWithoutThumbnailsFlow()(ctx)),
        fp.TE.bind("thumbnails", ({ media }) => {
          return pipe(
            media.map((m) =>
              pipe(
                pipe(
                  createThumbnail({
                    id: m.id,
                    location: ensureHTTPS(m.location),
                    type: m.type,
                    thumbnail: null,
                  })(ctx),
                  fp.TE.mapLeft(toControllerError),
                  fp.TE.filterOrElse(
                    (l) => l.length > 0,
                    () =>
                      toControllerError(new Error("No thumbnail generated")),
                  ),
                  fp.TE.fold<ControllerError, string[], Partial<MediaEntity>>(
                    (e) =>
                      fp.T.of({
                        extra: ImageMediaExtraMonoid.concat(
                          ImageMediaExtraMonoid.empty,
                          {
                            ...m.extra,
                            thumbnails: { error: e.message },
                          },
                        ),
                      }),
                    (l) =>
                      fp.T.of({
                        thumbnail: l[0],
                        extra: ImageMediaExtraMonoid.concat(
                          ImageMediaExtraMonoid.empty,
                          {
                            ...m.extra,
                            thumbnails: l,
                          },
                        ),
                      }),
                  ),
                  fp.TE.fromTask,
                ),
                LoggerService.TE.info(ctx, `Update for media %O`),
                fp.TE.chain((update) =>
                  MediaRepository.save([{ ...m, ...update }])(ctx),
                ),
                fp.TE.mapLeft(toControllerError),
                fp.TE.map((s) => s[0]),
                LoggerService.TE.info(ctx, (o) => [
                  `Generated thumbnail %s for media %s`,
                  o.thumbnail,
                  o.id,
                ]),
              ),
            ),
            fp.A.sequence(fp.TE.ApplicativeSeq),
          );
        }),
        fp.TE.map(({ media, thumbnails }) => {
          ctx.logger.info.log(
            `Generated ${thumbnails.length} thumbnails for ${media.length} media`,
          );
          return thumbnails;
        }),
        throwTE,
      ).catch((err) => {
        ctx.logger.error.log(`Generate missing thumbnails %O`, err);
      });
    },
    { name: "GENERATE_MISSING_THUMBNAILS" },
  );
