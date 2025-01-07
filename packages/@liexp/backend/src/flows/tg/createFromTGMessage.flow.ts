import { pipe } from "@liexp/core/lib/fp/index.js";
import { sequenceS } from "fp-ts/lib/Apply.js";
import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { type UUID } from "io-ts-types";
import type TelegramBot from "node-telegram-bot-api";
import { type ConfigContext } from "../../context/config.context.js";
import { type DatabaseContext } from "../../context/db.context.js";
import { type ENVContext } from "../../context/env.context.js";
import { type FSClientContext } from "../../context/fs.context.js";
import { type HTTPProviderContext } from "../../context/http.context.js";
import {
  type URLMetadataContext,
  type ImgProcClientContext,
  type TGBotProviderContext,
  type FFMPEGProviderContext,
} from "../../context/index.js";
import { type LoggerContext } from "../../context/logger.context.js";
import { type PDFProviderContext } from "../../context/pdf.context.js";
import { type PuppeteerProviderContext } from "../../context/puppeteer.context.js";
import { type QueuesProviderContext } from "../../context/queue.context.js";
import { type SpaceContext } from "../../context/space.context.js";
import {
  type PuppeteerError,
  toPuppeteerError,
} from "../../providers/puppeteer.provider.js";
import { getOneAdminOrFail } from "../user/getOneUserOrFail.flow.js";
import { MessageParser } from "./MessageParser/index.js";

export interface EventResult {
  link: UUID[];
  photos: UUID[];
  videos: UUID[];
  areas: UUID[];
  hashtags: string[];
}

export const createFromTGMessage =
  <
    C extends LoggerContext &
      DatabaseContext &
      PuppeteerProviderContext &
      TGBotProviderContext &
      HTTPProviderContext &
      ImgProcClientContext &
      SpaceContext &
      ENVContext &
      URLMetadataContext &
      QueuesProviderContext &
      ConfigContext &
      FSClientContext &
      FFMPEGProviderContext &
      PDFProviderContext,
  >(
    message: TelegramBot.Message,
    metadata: TelegramBot.Metadata,
  ): ReaderTaskEither<C, PuppeteerError, EventResult> =>
  (ctx) => {
    ctx.logger.info.log(
      "Received message %O with metadata %O",
      message,
      metadata,
    );

    const hashtags: string[] = (message.entities ?? [])
      .filter((e) => e.type === "hashtag")
      .map((h) => message.text?.slice(h.offset, h.length))
      .filter((s): s is string => typeof s !== "undefined");

    ctx.logger.info.log("Hashtags %O", hashtags);

    const messageParser = MessageParser(message);

    return pipe(
      getOneAdminOrFail<C>(ctx),
      TE.chain((creator) =>
        pipe(
          TE.bracket(
            pipe(
              ctx.puppeteer.getBrowserFirstPage("about:blank", {}),
              TE.mapLeft(toPuppeteerError),
            ),
            (page) =>
              sequenceS(TE.ApplicativeSeq)({
                link: messageParser.parseURLs(page, creator)(ctx),
                photos: messageParser.parsePhoto(ctx),
                videos: messageParser.parseVideo(ctx),
                documents: messageParser.parseDocument(ctx),
                platformMedia: messageParser.parsePlatformMedia(
                  page,
                  creator,
                )(ctx),
                hashtags: TE.right(hashtags),
                areas: TE.right([]),
              }),
            (page) =>
              TE.tryCatch(() => page.browser().close(), toPuppeteerError),
          ),
        ),
      ),
      TE.map(({ videos, platformMedia, ...others }) => ({
        ...others,
        videos: [...videos, ...platformMedia],
      })),
      TE.mapLeft((e) => {
        ctx.logger.error.log("Error %O", e);
        return e;
      }),
    );
  };
