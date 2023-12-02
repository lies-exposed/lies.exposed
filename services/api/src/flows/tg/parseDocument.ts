import { PDFType } from "@liexp/shared/lib/io/http/Media";
import { uuid } from "@liexp/shared/lib/utils/uuid";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import type TelegramBot from "node-telegram-bot-api";
import { createAndUpload } from "../media/createAndUpload.flow";
import { type MediaEntity } from "@entities/Media.entity";
import { type TEFlow } from "@flows/flow.types";
import { toControllerError } from "@io/ControllerError";

export const parseDocument: TEFlow<[TelegramBot.Document], MediaEntity[]> =
  (ctx) => (messageDocument) => {
    const mediaId = uuid();
    return pipe(
      TE.tryCatch(
        async () => ctx.tg.api.getFileStream(messageDocument.file_id),
        toControllerError,
      ),
      TE.chain((f) => {
        ctx.logger.debug.log("File downloaded %O", f);

        const contentType = messageDocument.mime_type as any ?? PDFType.value;
        return createAndUpload(ctx)(
          {
            type: contentType ,
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
