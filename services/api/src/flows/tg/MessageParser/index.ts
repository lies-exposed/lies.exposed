import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
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
import * as TE from "fp-ts/lib/TaskEither.js";
import type TelegramBot from "node-telegram-bot-api";
import type * as puppeteer from "puppeteer-core";
import { parseDocument } from "../parseDocument.flow.js";
import { parsePhoto } from "../parsePhoto.flow.js";
import { parsePlatformMedia } from "../parsePlatformMedia.flow.js";
import { parseURLs } from "../parseURL.flow.js";
import { parseVideo } from "../parseVideo.flow.js";
import { type ServerContext } from "#context/context.type.js";
import { type LinkEntity } from "#entities/Link.entity.js";
import { type MediaEntity } from "#entities/Media.entity.js";
import { type UserEntity } from "#entities/User.entity.js";
import { type TEReader } from "#flows/flow.types.js";

interface MessageParserAPI {
  parseDocument: TEReader<MediaEntity[]>;
  parsePhoto: TEReader<MediaEntity[]>;
  parseVideo: TEReader<MediaEntity[]>;
  parseURLs: (page: puppeteer.Page, user: UserEntity) => TEReader<LinkEntity[]>;
  parsePlatformMedia: (
    page: puppeteer.Page,
    user: UserEntity,
  ) => TEReader<MediaEntity[]>;
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

export const MessageParser = (
  message: TelegramBot.Message,
): MessageParserAPI => {
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
                  `Failed to do download file ${pp.unique}: %O`,
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
        fp.RTE.ask<ServerContext>(),
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
