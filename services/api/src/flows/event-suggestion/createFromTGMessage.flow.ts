import { EventV2Entity } from "@entities/Event.v2.entity";
import { EventSuggestionEntity } from "@entities/EventSuggestion.entity";
import { MediaEntity } from "@entities/Media.entity";
import {
  ControllerError,
  ServerError,
  toControllerError
} from "@io/ControllerError";
import { URL } from "@liexp/shared/io/http/Common";
import { MediaType } from "@liexp/shared/io/http/Media";
import { RouteContext } from "@routes/route.types";
import { sequenceS } from "fp-ts/lib/Apply";
import * as A from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";
import * as fs from "fs";
import TelegramBot from "node-telegram-bot-api";
import path from "path";
import { createAndUpload } from "../media/createAndUpload.flow";
import { createEventSuggestionFromMedia } from './createFromMedia.flow';
import { findEventByLinkOrCreateSuggestion } from "./findEventByLinkOrCreateSuggestion.flow";

type EventResult = Array<EventSuggestionEntity | EventV2Entity>;

const createMedia =
  (ctx: RouteContext) =>
  (
    description: string,
    photo: TelegramBot.PhotoSize[]
  ): TE.TaskEither<ControllerError, MediaEntity[]> => {
    return pipe(
      photo,
      A.map((p) => {
        const tempFolder = path.resolve(process.cwd(), "temp/media");

        return pipe(
          TE.tryCatch(
            () => ctx.tg.bot.downloadFile(p.file_id, tempFolder),
            toControllerError
          ),
          TE.chain((f) =>
            createAndUpload(ctx)(
              {
                type: MediaType.types[0].value,
                location: f,
                description,
                thumbnail: undefined,
              },
              fs.readFileSync(f)
            )
          )
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

    if (O.isNone(url)) {
      ctx.logger.debug.log("No url given, returning...");
      if (O.isNone(photo)) {
        ctx.logger.debug.log("No photo given, returning...");
        return TE.left(ServerError(["No url given", "No photo given"]));
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
      createMedia(ctx)(message.caption ?? "", message.photo ?? []),
      TE.chain((mm) => pipe(
        mm,
        A.map(m => createEventSuggestionFromMedia(ctx)(m, [])),
        A.sequence(TE.ApplicativePar)
      ))
    );

    return pipe(
      sequenceS(TE.ApplicativePar)({
        byUrl: byURLTask,
        byPhoto: byPhotoTask,
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
