import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type UUID, uuid } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { PDFType } from "@liexp/shared/lib/io/http/Media/MediaType.js";
import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import type TelegramBot from "node-telegram-bot-api";
import {
  type ImgProcClientContext,
  type FFMPEGProviderContext,
  type TGBotProviderContext,
} from "../../context";
import { type ConfigContext } from "../../context/config.context";
import { type DatabaseContext } from "../../context/db.context";
import { type ENVContext } from "../../context/env.context";
import { type FSClientContext } from "../../context/fs.context";
import { type HTTPProviderContext } from "../../context/http.context";
import { type LoggerContext } from "../../context/logger.context";
import { type PDFProviderContext } from "../../context/pdf.context";
import { type PuppeteerProviderContext } from "../../context/puppeteer.context";
import { type QueuesProviderContext } from "../../context/queue.context";
import { type SpaceContext } from "../../context/space.context";
import { ServerError } from "../../errors";
import { createAndUpload } from "../media/createAndUpload.flow";

export const parseDocument =
  <
    C extends TGBotProviderContext &
      LoggerContext &
      SpaceContext &
      ENVContext &
      QueuesProviderContext &
      DatabaseContext &
      ConfigContext &
      FSClientContext &
      HTTPProviderContext &
      PDFProviderContext &
      FFMPEGProviderContext &
      PuppeteerProviderContext &
      ImgProcClientContext,
  >(
    messageDocument: TelegramBot.Document,
  ): ReaderTaskEither<C, ServerError, UUID[]> =>
  (ctx) => {
    const mediaId = uuid();
    return pipe(
      ctx.tg.getFileStream(messageDocument),
      TE.mapLeft(ServerError.fromUnknown),
      fp.TE.filterOrElse(
        (m) => PDFType.is(messageDocument.mime_type),
        () => ServerError.fromUnknown(new Error("Invalid file type")),
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
