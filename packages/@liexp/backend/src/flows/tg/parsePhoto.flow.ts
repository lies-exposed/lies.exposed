import { pipe } from "@liexp/core/lib/fp/index.js";
import { type UUID, uuid } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { ImageType, MediaType } from "@liexp/shared/lib/io/http/Media/index.js";
import * as A from "fp-ts/lib/Array.js";
import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import type TelegramBot from "node-telegram-bot-api";
import { type ConfigContext } from "../../context/config.context.js";
import { type DatabaseContext } from "../../context/db.context.js";
import { type ENVContext } from "../../context/env.context.js";
import { type FSClientContext } from "../../context/fs.context.js";
import { type HTTPProviderContext } from "../../context/http.context.js";
import {
  type ImgProcClientContext,
  type FFMPEGProviderContext,
  type TGBotProviderContext,
} from "../../context/index.js";
import { type LoggerContext } from "../../context/logger.context.js";
import { type PDFProviderContext } from "../../context/pdf.context.js";
import { type PuppeteerProviderContext } from "../../context/puppeteer.context.js";
import { type QueuesProviderContext } from "../../context/queue.context.js";
import { type SpaceContext } from "../../context/space.context.js";
import { ServerError } from "../../errors/index.js";
import { createAndUpload } from "../media/createAndUpload.flow.js";

export const parsePhoto =
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
    description: string,
    photo: TelegramBot.PhotoSize[],
  ): ReaderTaskEither<C, ServerError, UUID[]> =>
  (ctx) => {
    return pipe(
      photo,
      A.map((p) => {
        const mediaId = uuid();
        return pipe(
          ctx.tg.getFileStream(p),
          TE.mapLeft(ServerError.fromUnknown),
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
