import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { PDFType } from "@liexp/shared/lib/io/http/Media.js";
import { uuid } from "@liexp/shared/lib/utils/uuid.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import type TelegramBot from "node-telegram-bot-api";
import { createAndUpload } from "../media/createAndUpload.flow.js";
import { type MediaEntity } from "#entities/Media.entity.js";
import { type TEFlow } from "#flows/flow.types.js";
import { toControllerError } from "#io/ControllerError.js";

export const parseDocument: TEFlow<[TelegramBot.Document], MediaEntity[]> =
  (ctx) => (messageDocument) => {
    const mediaId = uuid();
    return pipe(
      fp.IOE.tryCatch(
        () => ctx.tg.api.getFileStream(messageDocument.file_id),
        toControllerError,
      ),
      fp.TE.fromIOEither,
      TE.chain((f) => {
        ctx.logger.debug.log("File downloaded %O", f);

        const contentType = (messageDocument.mime_type as any) ?? PDFType.value;
        return createAndUpload(ctx)(
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
        );
      }),
      TE.map((m) => [m]),
    );
  };
