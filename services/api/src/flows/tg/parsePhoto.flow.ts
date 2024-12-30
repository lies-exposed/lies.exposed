import { pipe } from "@liexp/core/lib/fp/index.js";
import { type UUID, uuid } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { ImageType, MediaType } from "@liexp/shared/lib/io/http/Media/index.js";
import * as A from "fp-ts/lib/Array.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import type TelegramBot from "node-telegram-bot-api";
import { type TEReader } from "#flows/flow.types.js";
import { createAndUpload } from "#flows/media/createAndUpload.flow.js";
import { toControllerError } from "#io/ControllerError.js";

export const parsePhoto =
  (description: string, photo: TelegramBot.PhotoSize[]): TEReader<UUID[]> =>
  (ctx) => {
    return pipe(
      photo,
      A.map((p) => {
        const mediaId = uuid();
        return pipe(
          ctx.tg.getFileStream(p),
          TE.mapLeft(toControllerError),
          TE.chain((f) => {
            ctx.logger.debug.log("File downloaded %O", f);

            return createAndUpload(
              {
                type: MediaType.types[0].value,
                location: p.file_id,
                label: description,
                description,
                thumbnail: undefined,
                extra: undefined,
                events: [],
                links: [],
                keywords: [],
                areas: [],
              },
              {
                Body: f,
                ContentType: ImageType.types[0].value,
              },
              mediaId,
              false,
            )(ctx);
          }),
          TE.map(() => mediaId),
        );
      }),
      A.sequence(TE.ApplicativeSeq),
    );
  };
