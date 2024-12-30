import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type UUID, uuid } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { PDFType } from "@liexp/shared/lib/io/http/Media/MediaType.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import type TelegramBot from "node-telegram-bot-api";
import { type TEReader } from "#flows/flow.types.js";
import { createAndUpload } from "#flows/media/createAndUpload.flow.js";
import { toControllerError } from "#io/ControllerError.js";

export const parseDocument =
  (messageDocument: TelegramBot.Document): TEReader<UUID[]> =>
  (ctx) => {
    const mediaId = uuid();
    return pipe(
      ctx.tg.getFileStream(messageDocument),
      TE.mapLeft(toControllerError),
      fp.TE.filterOrElse(
        (m) => PDFType.is(messageDocument.mime_type),
        () => toControllerError(new Error("Invalid file type")),
      ),
      TE.chain((f) => {
        ctx.logger.debug.log("File downloaded %s", messageDocument.file_name);

        const contentType = (messageDocument.mime_type as any) ?? PDFType.value;

        return createAndUpload(
          {
            type: contentType,
            location: messageDocument.file_id,
            label: messageDocument.file_name,
            description: messageDocument.file_name,
            thumbnail: undefined,
            extra: undefined,
            events: [],
            links: [],
            keywords: [],
            areas: [],
          },
          {
            Body: f,
            ContentType: contentType,
          },
          mediaId,
          false,
        )(ctx);
      }),
      TE.map(() => [mediaId]),
    );
  };
