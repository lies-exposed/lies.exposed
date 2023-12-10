import { pipe } from "@liexp/core/lib/fp/index.js";
import { sequenceS } from "fp-ts/lib/Apply.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import type TelegramBot from "node-telegram-bot-api";
import { MessageParser } from "./MessageParser/index.js";
import { type AreaEntity } from "#entities/Area.entity.js";
import { type LinkEntity } from "#entities/Link.entity.js";
import { type MediaEntity } from "#entities/Media.entity.js";
import { type TEFlow } from "#flows/flow.types.js";
import { getOneAdminOrFail } from "#flows/users/getOneUserOrFail.flow.js";
import { toControllerError } from "#io/ControllerError.js";

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
