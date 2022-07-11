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
import { createAndUpload } from "../media/createAndUpload.flow";
import { createEventSuggestionFromMedia } from "./createFromMedia.flow";
import { findEventByLinkOrCreateSuggestion } from "./findEventByLinkOrCreateSuggestion.flow";
import { EventV2Entity } from "@entities/Event.v2.entity";
import { EventSuggestionEntity } from "@entities/EventSuggestion.entity";
import { MediaEntity } from "@entities/Media.entity";
import {
  ControllerError,
  ServerError,
  toControllerError,
} from "@io/ControllerError";
import { RouteContext } from "@routes/route.types";

type EventResult = Array<EventSuggestionEntity | EventV2Entity>;

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

    const hashtags = (message.entities ?? [])
      .filter((e) => e.type === "hashtag")
      .map((h) => message.text?.slice(h.offset, h.length));

    const byURLTask = pipe(
      url,
      O.map((u) =>
        pipe(
          findEventByLinkOrCreateSuggestion(ctx)(u as any, hashtags),
          TE.map((l) => O.some(l))
        )
      ),
      O.getOrElse(() =>
        TE.right<
          ControllerError,
          O.Option<EventSuggestionEntity | EventV2Entity>
        >(O.none)
      )
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
      TE.right,
      TE.chain((pp) => parsePhoto(ctx)(message.caption ?? "", pp.unique)),
      TE.chain((mm) =>
        mm.length > 0
          ? pipe(
              createEventSuggestionFromMedia(ctx)(mm, []),
              TE.map((es) => [es])
            )
          : TE.right([])
      )
    );

    const byVideoTask = O.isSome(video)
      ? pipe(parseVideo(ctx)(message.caption ?? "", video.value))
      : TE.right([]);

    return pipe(
      sequenceS(TE.ApplicativePar)({
        byUrl: byURLTask,
        byPhoto: byPhotoTask,
        byVideo: byVideoTask,
      }),
      TE.map(({ byUrl, byPhoto }) => {
        const byURLEvs: EventResult = pipe(
          byUrl,
          O.map((u) => [u]),
          O.getOrElse((): EventResult => [])
        );
        return [...byURLEvs, ...byPhoto];
      }),
      TE.mapLeft((e) => {
        ctx.logger.error.log("Error %O", e);
        return e;
      })
    );
  };
