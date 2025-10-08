import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type URL } from "@liexp/shared/lib/io/http/Common/URL.js";
import { type UUID, uuid } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { PDFType } from "@liexp/shared/lib/io/http/Media/MediaType.js";
import { Schema } from "effect";
import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import type TelegramBot from "node-telegram-bot-api";
import { type ConfigContext } from "../../context/config.context.js";
import { type DatabaseContext } from "../../context/db.context.js";
import { type ENVContext } from "../../context/env.context.js";
import { type FFMPEGProviderContext } from "../../context/ffmpeg.context.js";
import { type FSClientContext } from "../../context/fs.context.js";
import { type HTTPProviderContext } from "../../context/http.context.js";
import {
  type ImgProcClientContext,
  type TGBotProviderContext,
} from "../../context/index.js";
import { type LoggerContext } from "../../context/logger.context.js";
import { type PDFProviderContext } from "../../context/pdf.context.js";
import { type PuppeteerProviderContext } from "../../context/puppeteer.context.js";
import { type QueuesProviderContext } from "../../context/queue.context.js";
import { type SpaceContext } from "../../context/space.context.js";
import { ServerError } from "../../errors/index.js";
import { createAndUpload } from "../media/createAndUpload.flow.js";

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
        () => Schema.is(PDFType)(messageDocument.mime_type),
        () => ServerError.fromUnknown(new Error("Invalid file type")),
      ),
      TE.chain((f) => {
        ctx.logger.debug.log(
          "File downloaded %s (%s)",
          messageDocument.file_name,
          messageDocument.mime_type ?? "unknown",
        );

        const contentType = pipe(
          messageDocument.mime_type,
          Schema.decodeUnknownOption(PDFType),
          fp.O.getOrElse(() => PDFType.literals[0]),
        );

        return createAndUpload(
          {
            id: mediaId,
            type: contentType,
            location: messageDocument.file_id as URL,
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
