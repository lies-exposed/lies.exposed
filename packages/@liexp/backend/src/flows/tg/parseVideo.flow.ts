import { pipe } from "@liexp/core/lib/fp/index.js";
import { type URL } from "@liexp/shared/lib/io/http/Common/URL.js";
import { uuid, type UUID } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { MP4Type } from "@liexp/shared/lib/io/http/Media/index.js";
import { getMediaKey } from "@liexp/shared/lib/utils/media.utils.js";
import { ensureHTTPProtocol } from "@liexp/shared/lib/utils/url.utils.js";
import { sequenceS } from "fp-ts/lib/Apply.js";
import * as O from "fp-ts/lib/Option.js";
import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import type TelegramBot from "node-telegram-bot-api";
import { type ConfigContext } from "../../context/config.context.js";
import { type DatabaseContext } from "../../context/db.context.js";
import { type ENVContext } from "../../context/env.context.js";
import { type FSClientContext } from "../../context/fs.context.js";
import { type HTTPProviderContext } from "../../context/http.context.js";
import { type TGBotProviderContext } from "../../context/index.js";
import { type LoggerContext } from "../../context/logger.context.js";
import { type QueuesProviderContext } from "../../context/queue.context.js";
import { type RedisContext } from "../../context/redis.context.js";
import { type SpaceContext } from "../../context/space.context.js";
import { ServerError } from "../../errors/ServerError.js";
import { uploadAndCreate } from "../media/uploadAndCreate.flow.js";
import { upload } from "../space/upload.flow.js";

export const parseVideo =
  <
    C extends LoggerContext &
      TGBotProviderContext &
      SpaceContext &
      ENVContext &
      QueuesProviderContext &
      DatabaseContext &
      ConfigContext &
      FSClientContext &
      HTTPProviderContext &
      RedisContext,
  >(
    description: string,
    video: TelegramBot.Video,
  ): ReaderTaskEither<C, ServerError, UUID[]> =>
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
        TE.TaskEither<ServerError, string | undefined>
      >(
        () => TE.right(undefined),
        (file) =>
          pipe(
            ctx.tg.getFileStream(file),
            TE.mapLeft(ServerError.fromUnknown),
            TE.chain((f) => {
              return pipe(
                upload({
                  Key: getMediaKey("media", mediaId, mediaId, "image/jpeg"),
                  Body: f,
                })(ctx),
                TE.mapLeft(ServerError.fromUnknown),
              );
            }),
            TE.map((r) => ensureHTTPProtocol(r.Location)),
          ),
      ),
    );

    return pipe(
      sequenceS(TE.ApplicativePar)({
        video: pipe(
          ctx.tg.getFileStream(video),
          TE.mapLeft(ServerError.fromUnknown),
        ),
        thumb: thumbTask,
      }),
      TE.chain(({ video, thumb }) => {
        return uploadAndCreate(
          {
            id: mediaId,
            type: MP4Type.literals[0],
            location: "" as URL,
            label: description,
            description,
            thumbnail: thumb ? (thumb as URL) : undefined,
            extra: undefined,
            events: [],
            keywords: [],
            links: [],
            areas: [],
          },
          {
            Body: video,
            ContentType: MP4Type.literals[0],
          },
          mediaId,
          false,
        )(ctx);
      }),
      TE.map(() => [mediaId]),
    );
  };
