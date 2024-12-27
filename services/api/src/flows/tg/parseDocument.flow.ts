import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { uuid } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { MEDIA } from "@liexp/shared/lib/io/http/Media/Media.js";
import { PDFType } from "@liexp/shared/lib/io/http/Media/MediaType.js";
import {
  OpenAIEmbeddingQueueType,
  PendingStatus,
} from "@liexp/shared/lib/io/http/Queue.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import type TelegramBot from "node-telegram-bot-api";
import { createAndUpload } from "../media/createAndUpload.flow.js";
import { type MediaEntity } from "#entities/Media.entity.js";
import { type TEReader } from "#flows/flow.types.js";
import { toControllerError } from "#io/ControllerError.js";

export const parseDocument =
  (messageDocument: TelegramBot.Document): TEReader<MediaEntity[]> =>
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
        ctx.logger.debug.log("File downloaded %O", f);

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
      TE.chainFirst((m) =>
        ctx.queue.queue(OpenAIEmbeddingQueueType.value).addJob({
          id: m.id,
          resource: MEDIA.value,
          type: OpenAIEmbeddingQueueType.value,
          status: PendingStatus.value,
          error: null,
          data: {
            url: m.location,
            type: "pdf",
            result: undefined,
            prompt: undefined,
          },
        }),
      ),
      TE.map((m) => [m]),
    );
  };
