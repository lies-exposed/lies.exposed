import { fp } from "@liexp/core/lib/fp";
import { isExcludedURL } from "@liexp/shared/lib/helpers/link.helper";
import {
  getPlatform,
  type VideoPlatformMatch,
} from "@liexp/shared/lib/helpers/media";
import { URL } from "@liexp/shared/lib/io/http/Common";
import { MediaType, MP4Type } from "@liexp/shared/lib/io/http/Media";
import { ensureHTTPS } from "@liexp/shared/lib/utils/media.utils";
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
import { type AreaEntity } from "@entities/Area.entity";
import { LinkEntity } from "@entities/Link.entity";
import { MediaEntity } from "@entities/Media.entity";
import { type UserEntity } from "@entities/User.entity";
import { type TEFlow } from "@flows/flow.types";
import { fetchAndSave } from "@flows/links/link.flow";
import {
  takeLinkScreenshot,
  uploadScreenshot,
} from "@flows/links/takeLinkScreenshot.flow";
import { extractMediaFromPlatform } from "@flows/media/extractMediaFromPlatform.flow";
import { getOneAdminOrFail } from "@flows/users/getOneUserOrFail.flow";
import { toControllerError, type ControllerError } from "@io/ControllerError";

export interface EventResult {
  link: LinkEntity[];
  photos: MediaEntity[];
  videos: MediaEntity[];
  areas: AreaEntity[];
  hashtags: string[];
}

const parsePlatformMedia: TEFlow<
  [URL, VideoPlatformMatch, puppeteer.Page, UserEntity],
  MediaEntity[]
> = (ctx) => (url, m, page, creator) => {
  ctx.logger.debug.log("Parse platform media %O (%s)", m, url);
  return pipe(
    extractMediaFromPlatform(ctx)(url, m, page),
    TE.chain((media) => {
      return pipe(
        media.location,
        O.fromNullable,
        O.map((location) =>
          ctx.db.findOne(MediaEntity, { where: { location } }),
        ),
        O.fold(
          () => {
            return ctx.db.save(MediaEntity, [
              { ...media, creator: { id: creator.id } },
            ]);
          },
          (te) => {
            return pipe(
              te,
              TE.chain((record) => {
                if (O.isSome(record)) {
                  return TE.right([record.value]);
                }

                return ctx.db.save(MediaEntity, [
                  {
                    ...media,
                    description: media.description ?? media.location,
                    creator: { id: creator.id },
                  },
                ]);
              }),
            );
          },
        ),
      );
    }),
  );
};

const parseVideo: TEFlow<[string, TelegramBot.Video], MediaEntity[]> =
  (ctx) => (description, video) => {
    ctx.logger.debug.log("Parse video with description %O", {
      ...video,
      description,
    });

    const mediaId = uuid();
    const thumbTask: TE.TaskEither<ControllerError, string | undefined> = pipe(
      O.fromNullable(video.thumb?.file_id),
      O.fold(
        () => TE.right(undefined as any as string),
        (id) =>
          pipe(
            TE.tryCatch(async () => {
              ctx.logger.debug.log("Download thumb file from TG %s", id);
              const thumbFile = ctx.tg.api.getFileStream(id);
              ctx.logger.debug.log(
                "Thumb file stream length %d",
                thumbFile.readableLength,
              );
              return thumbFile;
            }, toControllerError),
            TE.chain((f) => {
              return ctx.s3.upload({
                Bucket: ctx.env.SPACE_BUCKET,
                Key: `public/media/${mediaId}/${mediaId}.jpg`,
                Body: f,
              });
            }),
            TE.mapLeft(toControllerError),
            TE.map((r) => ensureHTTPS(r.Location)),
          ),
      ),
    );

    return pipe(
      sequenceS(TE.ApplicativePar)({
        video: TE.tryCatch(async () => {
          ctx.logger.debug.log(
            "Download video file from TG %s (%d)MB",
            video.file_id,
            Math.ceil((video.file_size ?? 1) / 1000 / 1000),
          );
          const videoFile = ctx.tg.api.getFileStream(video.file_id);

          return videoFile;
        }, toControllerError),
        thumb: thumbTask,
      }),
      TE.chain(({ video, thumb }) => {
        return createAndUpload(ctx)(
          {
            type: MP4Type.value,
            location: "",
            label: description,
            description,
            thumbnail: thumb,
            extra: undefined,
            events: [],
            keywords: [],
            links: [],
            areas: [],
          },
          {
            Body: video,
            ContentType: MP4Type.value,
          },
          mediaId,
          false,
        );
      }),
      TE.map((m) => [m]),
    );
  };

const parsePhoto: TEFlow<[string, TelegramBot.PhotoSize[]], MediaEntity[]> =
  (ctx) =>
  (description, photo): TE.TaskEither<ControllerError, MediaEntity[]> => {
    return pipe(
      photo,
      A.map((p) => {
        const mediaId = uuid();
        return pipe(
          TE.tryCatch(
            async () => ctx.tg.api.getFileStream(p.file_id),
            toControllerError,
          ),
          TE.chain((f) => {
            ctx.logger.debug.log("File downloaded %O", f);

            return createAndUpload(ctx)(
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
              },
              mediaId,
              false,
            );
          }),
        );
      }),
      A.sequence(TE.ApplicativeSeq),
    );
  };

const takeURLFromMessageEntity =
  (text?: string) =>
  (acc: URL[], e: TelegramBot.MessageEntity): URL[] => {
    if (e.type === "url" && text) {
      return acc.concat(
        text.substring(e.offset, e.offset + e.length) as any as URL,
      );
    }
    if (e.type === "text_link") {
      return acc.concat(e.url as any as URL);
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
    metadata,
  );

  // check url exists and is linked to an event
  //  - if found return the event
  // fetch url metadata and create hashtags when given
  // save the event suggestion

  const { url: urlEntity, video: videoURLS } = [
    ...(message.entities ?? []).reduce(
      takeURLFromMessageEntity(message.text),
      [],
    ),
    ...(message.caption_entities ?? []).reduce(
      takeURLFromMessageEntity(message.caption),
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
        video: [] as Array<VideoPlatformMatch & { url: URL }>,
      },
    );

  ctx.logger.info.log("URL entity %O", urlEntity);
  ctx.logger.info.log("URL video entity %O", videoURLS);

  const urls = pipe(
    urlEntity.map(sanitizeURL),
    O.fromPredicate((u) => u.length > 0),
  );

  ctx.logger.info.log("URL %O", urls);

  const platformMediaURLs = pipe(
    videoURLS,
    O.fromPredicate((v) => v.length > 0),
  );

  ctx.logger.info.log("Message photo%O", message.photo);
  const photo = pipe(
    message.photo,
    O.fromPredicate((p) => (p?.length ?? 0) > 0),
  );

  ctx.logger.info.log("Photo %O", photo);

  const video = pipe(
    O.fromNullable(message.video),
    // O.filter((v) => (v.file_size ?? 0) < 20 * 1000),
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

          return TE.right({
            link: [],
            videos: [],
            photos: [],
            hashtags: [],
            areas: [],
          });
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
    user: UserEntity,
    page: puppeteer.Page,
  ): TE.TaskEither<ControllerError, LinkEntity[]> =>
    pipe(
      urls,
      O.map((urls) =>
        urls.filter((u) => {
          const isURL = E.isRight(URL.decode(u));
          const isAllowed = !isExcludedURL(u);

          return isURL && isAllowed;
        }),
      ),
      O.getOrElse((): URL[] => []),
      A.map((url) => {
        return pipe(
          ctx.db.findOne(LinkEntity, {
            where: {
              url: Equal(url),
            },
          }),
          TE.chain((link) => {
            if (O.isSome(link)) {
              ctx.logger.info.log("Link found %s", link.value.id);
              return TE.right(link.value);
            }

            return pipe(
              fetchAndSave(ctx)(user, url),
              TE.chain((link) =>
                pipe(
                  link.image?.thumbnail
                    ? TE.right(link)
                    : pipe(
                        takeLinkScreenshot(ctx)(link),
                        TE.chain((buffer) =>
                          uploadScreenshot(ctx)(link, buffer),
                        ),
                        TE.chain((l) =>
                          ctx.db.save(MediaEntity, [
                            { ...link.image, ...l, links: [link] },
                          ]),
                        ),
                        TE.map((media) => ({ ...link, image: media[0] }))
                      ),
                ),
              ),
              TE.mapLeft(toControllerError),
            );
          }),
        );
      }),
      A.sequence(TE.ApplicativeSeq),
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
      { unique: [] as TelegramBot.PhotoSize[], ids: [] as string[] },
    ),
    ctx.logger.debug.logInPipe("Photo to parse %O"),
    TE.right,
    TE.chain((pp) =>
      pipe(
        parsePhoto(ctx)(message.caption ?? "", pp.unique),
        TE.fold(
          (e) => {
            ctx.logger.warn.log(
              `Failed to do download file ${pp.unique}: %O`,
              e,
            );
            return fp.T.of(E.right([]));
          },
          (mm) => fp.T.of(fp.E.right(mm)),
        ),
      ),
    ),
  );

  ctx.logger.debug.log("Video to parse %O", video);
  const byVideoTask = pipe(
    video,
    O.fold(
      () => TE.right([]),
      (v) =>
        parseVideo(ctx)(
          message.caption ??
            (message.video as any)?.file_name ??
            message.video?.file_id,
          v,
        ),
    ),
  );

  const byPlatformMediaTask = (
    p: puppeteer.Page,
    creator: UserEntity,
  ): TE.TaskEither<ControllerError, MediaEntity[]> => {
    return pipe(
      videoURLS,
      A.map(({ url, ...m }) => parsePlatformMedia(ctx)(url, m, p, creator)),
      A.sequence(TE.ApplicativeSeq),
      TE.map(A.flatten),
    );
  };

  return pipe(
    getOneAdminOrFail(ctx),
    TE.chain((creator) =>
      pipe(
        TE.bracket(
          pipe(
            ctx.puppeteer.getBrowserFirstPage("about:blank", {}),
            TE.mapLeft(toControllerError),
          ),
          (page) =>
            sequenceS(TE.ApplicativePar)({
              link: byURLTask(creator, page),
              photos: byPhotoTask,
              videos: byVideoTask,
              platformMedia: byPlatformMediaTask(page, creator),
              hashtags: TE.right(hashtags),
              areas: TE.right([]),
            }),
          (page) =>
            TE.tryCatch(() => page.browser().close(), toControllerError),
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
