import * as fs from "fs";
import path from "path";
import { URL } from "@liexp/shared/io/http/Common";
import { MediaType } from "@liexp/shared/io/http/Media";
import { uuid } from "@liexp/shared/utils/uuid";
import { sequenceS } from "fp-ts/lib/Apply";
import * as A from "fp-ts/lib/Array";
import * as O from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import TelegramBot from "node-telegram-bot-api";
import { Equal } from "typeorm";
import { createAndUpload } from "../media/createAndUpload.flow";
import { LinkEntity } from "@entities/Link.entity";
import { MediaEntity } from "@entities/Media.entity";
import { fetchAndSave } from "@flows/link.flow";
import {
  ControllerError,
  ServerError,
  toControllerError
} from "@io/ControllerError";
import { RouteContext } from "@routes/route.types";

interface EventResult {
  link: LinkEntity | undefined;
  photos: MediaEntity[];
  videos: MediaEntity[];
  hashtags: string[];
}

const parseVideo =
  (ctx: RouteContext) =>
  (
    description: string,
    video: TelegramBot.Video
  ): TE.TaskEither<ControllerError, MediaEntity[]> => {
    const tempFolder = path.resolve(process.cwd(), "temp/tg/media");

    const thumbTask: TE.TaskEither<ControllerError, string | undefined> = pipe(
      O.fromNullable(video.thumb?.file_id),
      O.fold(
        () => TE.right(undefined as any as string),
        (id) =>
          pipe(
            TE.tryCatch(
              () => ctx.tg.bot.downloadFile(id, tempFolder),
              toControllerError
            ),
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

const parsePhoto =
  (ctx: RouteContext) =>
  (
    description: string,
    photo: TelegramBot.PhotoSize[]
  ): TE.TaskEither<ControllerError, MediaEntity[]> => {
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

export const createFromTGMessage =
  (ctx: RouteContext) =>
  (
    message: TelegramBot.Message,
    metadata: TelegramBot.Metadata
  ): TE.TaskEither<ControllerError, EventResult> => {
    ctx.logger.info.log(
      "Received message %O with metadata %O",
      message,
      metadata
    );
    // check url exists and is linked to an event
    //  - if found return the event
    // fetch url metadata and create hashtags when given
    // save the event suggestion

    const urlEntity = (message.entities ?? [])
      .concat(message.caption_entities ?? [])
      .reduce<URL[]>((acc, e) => {
        if (e.type === "url") {
          return acc.concat(message.text?.slice(e.offset, e.length) as any);
        }
        if (e.type === "text_link") {
          return acc.concat(e.url as any);
        }
        return acc;
      }, []);

    const url = pipe(O.fromNullable(urlEntity[0]));
    const photo = pipe(
      message.photo,
      O.fromPredicate((p) => (p?.length ?? 0) > 0)
    );

    const video = O.fromNullable(message.video);

    if (O.isNone(url)) {
      ctx.logger.debug.log("No url given...");
      if (O.isNone(photo)) {
        ctx.logger.debug.log("No photo given");
        if (O.isNone(video)) {
          ctx.logger.debug.log("No video given");
          return TE.left(
            ServerError(["No url given", "No photo given", "No video given"])
          );
        }
      }
    }

    const hashtags: string[] = (message.entities ?? [])
      .filter((e) => e.type === "hashtag")
      .map((h) => message.text?.slice(h.offset, h.length))
      .filter((s): s is string => typeof s !== "undefined");

    const byURLTask = pipe(
      url,
      O.map((u) =>
        pipe(
          ctx.db.findOne(LinkEntity, {
            where: {
              url: Equal(u),
            },
          }),
          TE.chain((link) => {
            if (O.isSome(link)) {
              return TE.right(link);
            }
            return pipe(
              fetchAndSave(ctx)(u),
              TE.mapLeft(toControllerError),
              TE.map((l) => O.some(l))
            );
          })
        )
      ),
      O.getOrElse(() => TE.right<ControllerError, O.Option<LinkEntity>>(O.none))
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
      ctx.logger.debug.logInPipe('Photo to parse %O'),
      TE.right,
      TE.chain((pp) => parsePhoto(ctx)(message.caption ?? "", pp.unique))
    );

    const byVideoTask = O.isSome(video)
      ? pipe(parseVideo(ctx)(message.caption ?? "", video.value))
      : TE.right([]);

    return pipe(
      sequenceS(TE.ApplicativePar)({
        link: byURLTask,
        photos: byPhotoTask,
        videos: byVideoTask,
        hashtags: TE.right(hashtags),
      }),
      TE.map(({ link, ...result }) => ({
        ...result,
        link: O.toUndefined(link),
      })),
      TE.mapLeft((e) => {
        ctx.logger.error.log("Error %O", e);
        return e;
      })
    );
  };
