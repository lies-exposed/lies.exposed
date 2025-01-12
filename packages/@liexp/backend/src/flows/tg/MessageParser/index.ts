import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { isExcludedURL } from "@liexp/shared/lib/helpers/link.helper.js";
import {
  type VideoPlatformMatch,
  getPlatform,
} from "@liexp/shared/lib/helpers/media.helper.js";
import { type URL } from "@liexp/shared/lib/io/http/Common/URL.js";
import { sanitizeURL } from "@liexp/shared/lib/utils/url.utils.js";
import * as E from "fp-ts/lib/Either.js";
import * as O from "fp-ts/lib/Option.js";
import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { type UUID } from "io-ts-types";
import type TelegramBot from "node-telegram-bot-api";
import type * as puppeteer from "puppeteer-core";
import { type ConfigContext } from "../../../context/config.context.js";
import { type DatabaseContext } from "../../../context/db.context.js";
import { type ENVContext } from "../../../context/env.context.js";
import { type FSClientContext } from "../../../context/fs.context.js";
import { type HTTPProviderContext } from "../../../context/http.context.js";
import {
  type URLMetadataContext,
  type TGBotProviderContext,
  type FFMPEGProviderContext,
  type ImgProcClientContext,
} from "../../../context/index.js";
import { type LoggerContext } from "../../../context/logger.context.js";
import { type PDFProviderContext } from "../../../context/pdf.context.js";
import { type PuppeteerProviderContext } from "../../../context/puppeteer.context.js";
import { type QueuesProviderContext } from "../../../context/queue.context.js";
import { type SpaceContext } from "../../../context/space.context.js";
import { type UserEntity } from "../../../entities/User.entity.js";
import { type TGError } from "../../../providers/tg/tg.provider.js";
import { LoggerService } from "../../../services/logger/logger.service.js";
import { parseDocument } from "../parseDocument.flow.js";
import { parsePhoto } from "../parsePhoto.flow.js";
import { parsePlatformMedia } from "../parsePlatformMedia.flow.js";
import { parseURLs } from "../parseURL.flow.js";
import { parseVideo } from "../parseVideo.flow.js";

interface MessageParserAPI<
  C extends DatabaseContext &
    TGBotProviderContext &
    LoggerContext &
    SpaceContext &
    ENVContext &
    URLMetadataContext &
    QueuesProviderContext &
    PuppeteerProviderContext,
> {
  parseDocument: ReaderTaskEither<C, TGError, UUID[]>;
  parsePhoto: ReaderTaskEither<C, TGError, UUID[]>;
  parseVideo: ReaderTaskEither<C, TGError, UUID[]>;
  parseURLs: (
    page: puppeteer.Page,
    user: UserEntity,
  ) => ReaderTaskEither<C, TGError, UUID[]>;
  parsePlatformMedia: (
    page: puppeteer.Page,
    user: UserEntity,
  ) => ReaderTaskEither<C, TGError, UUID[]>;
}

const takeURLsFromMessageEntity =
  (text?: string) =>
  (acc: URL[], e: TelegramBot.MessageEntity): URL[] => {
    if (e.type === "url" && text) {
      return acc.concat(
        text.substring(e.offset, e.offset + e.length) as unknown as URL,
      );
    }
    if (e.type === "text_link") {
      return acc.concat(e.url as unknown as URL);
    }
    return acc;
  };

export const MessageParser = <
  C extends DatabaseContext &
    TGBotProviderContext &
    LoggerContext &
    SpaceContext &
    ENVContext &
    URLMetadataContext &
    QueuesProviderContext &
    PuppeteerProviderContext &
    ConfigContext &
    FFMPEGProviderContext &
    FSClientContext &
    HTTPProviderContext &
    PDFProviderContext &
    ImgProcClientContext,
>(
  message: TelegramBot.Message,
): MessageParserAPI<C> => {
  const { url: urlEntity, video: videoURLS } = [
    ...(message.entities ?? []).reduce(
      takeURLsFromMessageEntity(message.text),
      [],
    ),
    ...(message.caption_entities ?? []).reduce(
      takeURLsFromMessageEntity(message.caption),
      [],
    ),
  ]
    .filter((u) => !isExcludedURL(u))
    .reduce(
      (acc, url) => {
        const platformURL = getPlatform(url);
        if (E.isRight(platformURL)) {
          return {
            ...acc,
            video: acc.video.concat({ ...platformURL.right, url }),
          };
        }

        return {
          ...acc,
          url: acc.url.concat(url),
        };
      },
      {
        url: [] as URL[],
        video: [] as (VideoPlatformMatch & { url: URL })[],
      },
    );

  const urls = pipe(
    urlEntity.map(sanitizeURL),
    O.fromPredicate((u) => u.length > 0),
  );

  const platformMediaURLs = pipe(
    videoURLS,
    O.fromPredicate((v) => v.length > 0),
  );

  const messageDocument = pipe(O.fromNullable(message.document));
  const messagePhoto = message.photo ?? [];
  const messageVideo = pipe(O.fromNullable(message.video));

  return {
    parseDocument: (ctx) =>
      pipe(
        messageDocument,
        O.fold(
          () => TE.right([]),
          (m) => parseDocument(m)(ctx),
        ),
      ),
    parsePhoto: (ctx) =>
      pipe(
        messagePhoto.reduce(
          (acc, p) => {
            if (
              !acc.unique.some((u) => u.file_id === p.file_id) &&
              p.width > 1000
            ) {
              return {
                unique: acc.unique.concat(p),
                ids: acc.ids.concat(p.file_id),
              };
            }

            return acc;
          },
          { unique: [] as TelegramBot.PhotoSize[], ids: [] as string[] },
        ),
        TE.right,
        LoggerService.TE.debug(ctx, "Photo to parse %O"),
        TE.chain((pp) =>
          pipe(
            parsePhoto(message.caption ?? "", pp.unique)(ctx),
            TE.fold(
              (e) => {
                ctx.logger.warn.log(
                  `Failed to do download file ${pp.unique.at(0)?.file_id}: %O`,
                  e,
                );
                return fp.T.of(fp.E.right([]));
              },
              (mm) => fp.T.of(fp.E.right(mm)),
            ),
          ),
        ),
      ),
    parseVideo: (ctx) =>
      pipe(
        messageVideo,
        O.fold(
          () => TE.right([]),
          (v) =>
            parseVideo(
              message.caption ??
                (message.video as any)?.file_name ??
                message.video?.file_id,
              v,
            )(ctx),
        ),
      ),
    parseURLs: (page, creator) => parseURLs(urls, creator, page),
    parsePlatformMedia: (p, creator) =>
      pipe(
        fp.RTE.ask<C>(),
        fp.RTE.chainTaskEitherK((ctx) =>
          pipe(
            platformMediaURLs,
            fp.O.fold(
              () => TE.right([]),
              (urls) =>
                pipe(
                  urls,
                  fp.A.map(({ url, ...m }) =>
                    parsePlatformMedia(url, m, p, creator)(ctx),
                  ),
                  fp.A.sequence(TE.ApplicativeSeq),
                  fp.TE.map(fp.A.flatten),
                ),
            ),
          ),
        ),
      ),
  };
};
