import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { MP4Type } from "@liexp/shared/lib/io/http/Media.js";
import { ensureHTTPS } from "@liexp/shared/lib/utils/media.utils.js";
import { uuid } from "@liexp/shared/lib/utils/uuid.js";
import { sequenceS } from "fp-ts/Apply";
import * as O from "fp-ts/Option";
import * as TE from "fp-ts/TaskEither";
import type TelegramBot from "node-telegram-bot-api";
import { createAndUpload } from "../media/createAndUpload.flow.js";
import { type MediaEntity } from "#entities/Media.entity.js";
import { type TEFlow } from "#flows/flow.types.js";
import {
  toControllerError,
  type ControllerError,
} from "#io/ControllerError.js";

export const parseVideo: TEFlow<[string, TelegramBot.Video], MediaEntity[]> =
  (ctx) => (description, video) => {
    ctx.logger.debug.log("Parse video with description %O", {
      ...video,
      description,
    });

    const mediaId = uuid();
    const thumbTask: TE.TaskEither<ControllerError, string | undefined> = pipe(
      O.fromNullable(video.thumb?.file_id),
      O.fold(
        () => TE.right(undefined as any as string),
        (id) =>
          pipe(
            fp.IOE.tryCatch(() => {
              ctx.logger.debug.log("Download thumb file from TG %s", id);
              const thumbFile = ctx.tg.api.getFileStream(id);
              ctx.logger.debug.log(
                "Thumb file stream length %d",
                thumbFile.readableLength,
              );
              return thumbFile;
            }, toControllerError),
            TE.fromIOEither,
            TE.chain((f) => {
              return ctx.s3.upload({
                Bucket: ctx.env.SPACE_BUCKET,
                Key: `public/media/${mediaId}/${mediaId}.jpg`,
                Body: f,
              });
            }),
            TE.mapLeft(toControllerError),
            TE.map((r) => ensureHTTPS(r.Location)),
          ),
      ),
    );

    return pipe(
      sequenceS(TE.ApplicativePar)({
        video: TE.tryCatch(async () => {
          ctx.logger.debug.log(
            "Download video file from TG %s (%d)MB",
            video.file_id,
            Math.ceil((video.file_size ?? 1) / 1000 / 1000),
          );
          const videoFile = ctx.tg.api.getFileStream(video.file_id);

          return Promise.resolve(videoFile);
        }, toControllerError),
        thumb: thumbTask,
      }),
      TE.chain(({ video, thumb }) => {
        return createAndUpload(ctx)(
          {
            type: MP4Type.value,
            location: "",
            label: description,
            description,
            thumbnail: thumb,
            extra: undefined,
            events: [],
            keywords: [],
            links: [],
            areas: [],
          },
          {
            Body: video,
            ContentType: MP4Type.value,
          },
          mediaId,
          false,
        );
      }),
      TE.map((m) => [m]),
    );
  };
