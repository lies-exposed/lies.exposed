import { sequenceS } from "fp-ts/Apply";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import type TelegramBot from "node-telegram-bot-api";
import { MessageParser } from "./MessageParser";
import { type AreaEntity } from "@entities/Area.entity";
import { type LinkEntity } from "@entities/Link.entity";
import { type MediaEntity } from "@entities/Media.entity";
import { type TEFlow } from "@flows/flow.types";
import { getOneAdminOrFail } from "@flows/users/getOneUserOrFail.flow";
import { toControllerError } from "@io/ControllerError";

export interface EventResult {
  link: LinkEntity[];
  photos: MediaEntity[];
  videos: MediaEntity[];
  areas: AreaEntity[];
  hashtags: string[];
}

export const createFromTGMessage: TEFlow<
  [TelegramBot.Message, TelegramBot.Metadata],
  EventResult
> = (ctx) => (message, metadata) => {
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
              link: messageParser.parseURL(ctx)(page, creator),
              photos: messageParser.parsePhoto(ctx),
              videos: messageParser.parseVideo(ctx),
              documents: messageParser.parseDocument(ctx),
              platformMedia: messageParser.parsePlatformMedia(ctx)(
                page,
                creator,
              ),
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
