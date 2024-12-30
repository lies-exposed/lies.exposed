import { pipe } from "@liexp/core/lib/fp/index.js";
import { uuid, type UUID } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { MP4Type } from "@liexp/shared/lib/io/http/Media/index.js";
import { ensureHTTPS } from "@liexp/shared/lib/utils/media.utils.js";
import { sequenceS } from "fp-ts/lib/Apply.js";
import * as O from "fp-ts/lib/Option.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import type TelegramBot from "node-telegram-bot-api";
import { type TEReader } from "#flows/flow.types.js";
import { createAndUpload } from "#flows/media/createAndUpload.flow.js";
import { upload } from "#flows/space/upload.flow.js";
import {
  toControllerError,
  type ControllerError,
} from "#io/ControllerError.js";

export const parseVideo =
  (description: string, video: TelegramBot.Video): TEReader<UUID[]> =>
  (ctx) => {
    ctx.logger.debug.log("Parse video with description %O", {
      ...video,
      description,
    });

    const mediaId = uuid();
    const thumbTask = pipe(
      O.fromNullable(video.thumb),
      O.fold<
        TelegramBot.PhotoSize,
        TE.TaskEither<ControllerError, string | undefined>
      >(
        () => TE.right(undefined),
        (file) =>
          pipe(
            ctx.tg.getFileStream(file),
            TE.mapLeft(toControllerError),
            TE.chain((f) => {
              return upload({
                Key: `public/media/${mediaId}/${mediaId}.jpg`,
                Body: f,
              })(ctx);
            }),
            TE.map((r) => ensureHTTPS(r.Location)),
          ),
      ),
    );

    return pipe(
      sequenceS(TE.ApplicativePar)({
        video: pipe(ctx.tg.getFileStream(video), TE.mapLeft(toControllerError)),
        thumb: thumbTask,
      }),
      TE.chain(({ video, thumb }) => {
        return createAndUpload(
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
        )(ctx);
      }),
      TE.map(() => [mediaId]),
    );
  };
