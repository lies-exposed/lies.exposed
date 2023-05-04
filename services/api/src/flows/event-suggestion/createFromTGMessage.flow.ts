import * as fs from "fs";
import path from "path";
import { isExcludedURL } from "@liexp/shared/lib/helpers/link.helper";
import {
  getPlatform,
  type VideoPlatformMatch,
} from "@liexp/shared/lib/helpers/media";
import { URL } from "@liexp/shared/lib/io/http/Common";
import { MediaType } from "@liexp/shared/lib/io/http/Media";
import { sanitizeURL } from "@liexp/shared/lib/utils/url.utils";
import { uuid } from "@liexp/shared/lib/utils/uuid";
import { sequenceS } from "fp-ts/Apply";
import * as A from "fp-ts/Array";
import * as E from "fp-ts/Either";
import * as O from "fp-ts/Option";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import type TelegramBot from "node-telegram-bot-api";
import type * as puppeteer from "puppeteer-core";
import { Equal } from "typeorm";
import { createAndUpload } from "../media/createAndUpload.flow";
import { LinkEntity } from "@entities/Link.entity";
import { MediaEntity } from "@entities/Media.entity";
import { type UserEntity } from "@entities/User.entity";
import { type TEFlow } from "@flows/flow.types";
import { fetchAndSave } from "@flows/link.flow";
import { extractMediaFromPlatform } from "@flows/media/extractMediaFromPlatform.flow";
import { getOneAdminOrFail } from "@flows/users/getOneUserOrFail.flow";
import {
  ServerError,
  toControllerError,
  type ControllerError,
} from "@io/ControllerError";

export interface EventResult {
  link: LinkEntity[];
  photos: MediaEntity[];
  videos: MediaEntity[];
  hashtags: string[];
}

const parsePlatformMedia: TEFlow<
  [URL, VideoPlatformMatch, puppeteer.Page, UserEntity],
  MediaEntity
> = (ctx) => (url, m, page, creator) => {
  ctx.logger.debug.log("Parse platform media %O (%s)", m, url);
  return pipe(
    extractMediaFromPlatform(ctx)(url, m, page),
    TE.chain((media) => {
      return ctx.db.save(MediaEntity, [
        { ...media, creator: { id: creator.id } },
      ]);
    }),
    TE.map((d) => d[0])
  );
};

const parseVideo: TEFlow<[string, TelegramBot.Video], MediaEntity[]> =
  (ctx) => (description, video) => {
    const tempFolder = path.resolve(process.cwd(), "temp/tg/media");

    const thumbTask: TE.TaskEither<ControllerError, string | undefined> = pipe(
      O.fromNullable(video.thumb?.file_id),
      O.fold(
        () => TE.right(undefined as any as string),
        (id) =>
          pipe(
            TE.tryCatch(() => {
              ctx.logger.debug.log("Download file from TG %s", id);
              return ctx.tg.bot.downloadFile(id, tempFolder);
            }, toControllerError),
            TE.chain((f) =>
              ctx.s3.upload({
                Bucket: ctx.env.SPACE_BUCKET,
                Key: `public/media/${uuid()}`,
                Body: fs.readFileSync(f),
              })
            ),
            TE.mapLeft(toControllerError),
            TE.map((r) => r.Location)
          )
      )
    );

    return pipe(
      sequenceS(TE.ApplicativePar)({
        video: TE.tryCatch(
          () => ctx.tg.bot.downloadFile(video.file_id, tempFolder),
          toControllerError
        ),
        thumb: thumbTask,
      }),
      TE.chain(({ video, thumb }) => {
        ctx.logger.debug.log("File downloaded %O", { video, thumb });

        return createAndUpload(ctx)(
          {
            type: MediaType.types[3].value,
            location: video,
            description,
            thumbnail: thumb,
          },
          fs.readFileSync(video)
        );
      }),
      TE.map((m) => [m])
    );
  };

const parsePhoto: TEFlow<[string, TelegramBot.PhotoSize[]], MediaEntity[]> =
  (ctx) =>
  (description, photo): TE.TaskEither<ControllerError, MediaEntity[]> => {
    return pipe(
      photo,
      A.map((p) => {
        const tempFolder = path.resolve(process.cwd(), "temp/tg/media");

        return pipe(
          TE.tryCatch(
            () => ctx.tg.bot.downloadFile(p.file_id, tempFolder),
            toControllerError
          ),
          TE.chain((f) => {
            ctx.logger.debug.log("File downloaded %O", f);

            return createAndUpload(ctx)(
              {
                type: MediaType.types[0].value,
                location: f,
                description,
                thumbnail: undefined,
              },
              fs.readFileSync(f)
            );
          })
        );
      }),
      A.sequence(TE.ApplicativeSeq)
    );
  };

const takeURLFromMessageEntity =
  (text?: string) =>
  (acc: URL[], e: TelegramBot.MessageEntity): URL[] => {
    if (e.type === "url" && text) {
      return acc.concat(text.substring(e.offset, e.offset + e.length) as any);
    }
    if (e.type === "text_link") {
      return acc.concat(e.url as any);
    }
    return acc;
  };

export const createFromTGMessage: TEFlow<
  [TelegramBot.Message, TelegramBot.Metadata],
  EventResult
> = (ctx) => (message, metadata) => {
  ctx.logger.info.log(
    "Received message %O with metadata %O",
    message,
    metadata
  );

  // check url exists and is linked to an event
  //  - if found return the event
  // fetch url metadata and create hashtags when given
  // save the event suggestion

  const { url: urlEntity, video: videoURLS } = [
    ...(message.entities ?? []).reduce(
      takeURLFromMessageEntity(message.text),
      []
    ),
    ...(message.caption_entities ?? []).reduce(
      takeURLFromMessageEntity(message.caption),
      []
    ),
  ].reduce(
    (acc, url) => {
      const platformURL = getPlatform(url);
      if (E.isRight(platformURL)) {
        return {
          ...acc,
          video: acc.video.concat({ ...platformURL.right, url }),
        };
      }

      if (!isExcludedURL(url)) {
        return {
          ...acc,
          url: acc.url.concat(url),
        };
      }
      return acc;
    },
    {
      url: [] as URL[],
      video: [] as Array<VideoPlatformMatch & { url: URL }>,
    }
  );

  ctx.logger.info.log("URL entity %O", urlEntity);
  ctx.logger.info.log("URL video entity %O", videoURLS);

  const urls = pipe(
    urlEntity.map(sanitizeURL),
    O.fromPredicate((u) => u.length > 0)
  );

  ctx.logger.info.log("URL %O", urls);

  const platformMediaURLs = pipe(
    videoURLS,
    O.fromPredicate((v) => v.length > 0)
  );

  ctx.logger.info.log("Message photo%O", message.photo);
  const photo = pipe(
    message.photo,
    O.fromPredicate((p) => (p?.length ?? 0) > 0)
  );

  ctx.logger.info.log("Photo %O", photo);

  const video = pipe(
    O.fromNullable(message.video),
    O.filter((v) => (v.file_size ?? 0) < 20 * 1000)
  );

  ctx.logger.info.log("Video %O", video);

  if (O.isNone(urls)) {
    ctx.logger.info.log("No url given...");
    if (O.isNone(platformMediaURLs)) {
      ctx.logger.info.log("No platform url given...");
      if (O.isNone(photo)) {
        ctx.logger.info.log("No photo given");
        if (O.isNone(video)) {
          ctx.logger.info.log("No video given");

          return TE.left(
            ServerError([
              "No url given",
              "No platform url given",
              "No photo given",
              "No video given",
            ])
          );
        }
      }
    }
  }

  const hashtags: string[] = (message.entities ?? [])
    .filter((e) => e.type === "hashtag")
    .map((h) => message.text?.slice(h.offset, h.length))
    .filter((s): s is string => typeof s !== "undefined");

  ctx.logger.info.log("Hashtags %O", hashtags);

  const byURLTask = (
    user: UserEntity
  ): TE.TaskEither<ControllerError, LinkEntity[]> =>
    pipe(
      urls,
      O.map((urls) => urls.filter((u) => E.isRight(URL.decode(u)))),
      O.getOrElse((): URL[] => []),
      A.map((url) => {
        return pipe(
          ctx.db.findOne(LinkEntity, {
            where: {
              url: Equal(url),
            },
          }),
          TE.chain((link) => {
            ctx.logger.info.log("Link %O", link);
            if (O.isSome(link)) {
              return TE.right(link.value);
            }

            return pipe(
              fetchAndSave(ctx)(user, url),
              TE.mapLeft(toControllerError)
            );
          })
        );
      }),
      A.sequence(TE.ApplicativeSeq)
    );

  const byPhotoTask = pipe(
    (message.photo ?? []).reduce(
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
      { unique: [] as TelegramBot.PhotoSize[], ids: [] as string[] }
    ),
    ctx.logger.debug.logInPipe("Photo to parse %O"),
    TE.right,
    TE.chain((pp) => parsePhoto(ctx)(message.caption ?? "", pp.unique))
  );

  ctx.logger.debug.log("Video to parse %O", video);
  const byVideoTask = O.isSome(video)
    ? pipe(parseVideo(ctx)(message.caption ?? "", video.value))
    : TE.right([]);

  const byPlatformMediaTask = (
    p: puppeteer.Page,
    creator: UserEntity
  ): TE.TaskEither<ControllerError, MediaEntity[]> => {
    return pipe(
      videoURLS,
      A.map(({ url, ...m }) => parsePlatformMedia(ctx)(url, m, p, creator)),
      A.sequence(TE.ApplicativeSeq)
    );
  };
  return pipe(
    getOneAdminOrFail(ctx),
    TE.chain((creator) =>
      pipe(
        TE.bracket(
          pipe(
            ctx.puppeteer.getBrowserFirstPage("about:blank", {
              headless: true,
            }),
            TE.mapLeft(toControllerError)
          ),
          (page) =>
            sequenceS(TE.ApplicativePar)({
              link: byURLTask(creator),
              photos: byPhotoTask,
              videos: byVideoTask,
              platformMedia: byPlatformMediaTask(page, creator),
              hashtags: TE.right(hashtags),
            }),
          (page) => TE.tryCatch(() => page.browser().close(), toControllerError)
        )
      )
    ),
    TE.map(({ videos, platformMedia, ...others }) => ({
      ...others,
      videos: [...videos, ...platformMedia],
    })),

    TE.mapLeft((e) => {
      ctx.logger.error.log("Error %O", e);
      return e;
    })
  );
};
