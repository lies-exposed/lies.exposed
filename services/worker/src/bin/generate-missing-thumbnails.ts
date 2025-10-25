import { type MediaEntity } from "@liexp/backend/lib/entities/Media.entity.js";
import { getMediaWithoutThumbnailsFlow } from "@liexp/backend/lib/flows/media/admin/getMediaAdminStats.flow.js";
import { createThumbnail } from "@liexp/backend/lib/flows/media/thumbnails/createThumbnail.flow.js";
import { MediaRepository } from "@liexp/backend/lib/services/entity-repository.service.js";
import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type URL } from "@liexp/shared/lib/io/http/Common/URL.js";
import { ImageMediaExtraMonoid } from "@liexp/shared/lib/io/http/Media/MediaExtra.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import { ensureHTTPProtocol } from "@liexp/shared/lib/utils/url.utils.js";
import { type CommandFlow } from "./command.type.js";

const toWorkerError = (error: unknown): Error => {
  if (error instanceof Error) {
    return error;
  }
  return new Error(String(error));
};

export const generateMissingThumbnails: CommandFlow = async (
  ctx,
  args,
): Promise<void> => {
  const [limitStr] = args;

  // Handle help request
  if (limitStr === "--help" || limitStr === "-h") {
    ctx.logger.info.log(`
Usage: generate-missing-thumbnails [limit]

Generate thumbnails for media that are missing thumbnails.

Options:
  limit    Optional number to limit how many media items to process (default: all)
  --help   Show this help message

Examples:
  generate-missing-thumbnails       # Process all media without thumbnails
  generate-missing-thumbnails 10    # Process only the first 10 media items
`);
    return;
  }

  const limit = limitStr ? parseInt(limitStr, 10) : undefined;

  if (limitStr && isNaN(limit!)) {
    throw new Error(
      `Invalid limit parameter: ${limitStr}. Must be a number or --help.`,
    );
  }

  ctx.logger.info.log("Starting thumbnail generation...", { limit });

  await pipe(
    fp.TE.Do,
    fp.TE.bind("media", () => getMediaWithoutThumbnailsFlow()(ctx)),
    fp.TE.map(({ media }) => {
      // Apply limit if specified
      const mediaToProcess = limit ? media.slice(0, limit) : media;
      ctx.logger.info.log(
        `Found ${media.length} media without thumbnails. Processing ${mediaToProcess.length}`,
      );
      return { media: mediaToProcess };
    }),
    fp.TE.bind("thumbnails", ({ media }) => {
      return pipe(
        media.map((m) =>
          pipe(
            pipe(
              createThumbnail({
                id: m.id,
                location: ensureHTTPProtocol(m.location),
                type: m.type,
                thumbnail: null,
              })(ctx),
              fp.TE.mapLeft(toWorkerError),
              fp.TE.filterOrElse(
                (l) => l.length > 0,
                () => toWorkerError(new Error("No thumbnail generated")),
              ),
              fp.TE.fold<Error, readonly URL[], Partial<MediaEntity>>(
                (e) =>
                  fp.T.of({
                    extra: ImageMediaExtraMonoid.concat(
                      ImageMediaExtraMonoid.empty,
                      {
                        ...ImageMediaExtraMonoid.empty,
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
                        ...ImageMediaExtraMonoid.empty,
                        ...m.extra,
                        thumbnails: l,
                      },
                    ),
                  }),
              ),
              fp.TE.fromTask,
            ),
            LoggerService.TE.info(ctx, `Update for media ${m.id}`),
            fp.TE.chain((update) =>
              MediaRepository.save([{ ...m, ...update }])(ctx),
            ),
            fp.TE.mapLeft(toWorkerError),
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
        `Successfully generated ${thumbnails.length} thumbnails for ${media.length} media`,
      );
      return thumbnails;
    }),
    throwTE,
  );
};
