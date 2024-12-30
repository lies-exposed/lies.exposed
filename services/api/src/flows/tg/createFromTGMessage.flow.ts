import { pipe } from "@liexp/core/lib/fp/index.js";
import { sequenceS } from "fp-ts/lib/Apply.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { type UUID } from "io-ts-types";
import type TelegramBot from "node-telegram-bot-api";
import { MessageParser } from "./MessageParser/index.js";
import { type TEReader } from "#flows/flow.types.js";
import { getOneAdminOrFail } from "#flows/users/getOneUserOrFail.flow.js";
import { toControllerError } from "#io/ControllerError.js";

export interface EventResult {
  link: UUID[];
  photos: UUID[];
  videos: UUID[];
  areas: UUID[];
  hashtags: string[];
}

export const createFromTGMessage =
  (
    message: TelegramBot.Message,
    metadata: TelegramBot.Metadata,
  ): TEReader<EventResult> =>
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
      getOneAdminOrFail(ctx),
      TE.chain((creator) =>
        pipe(
          TE.bracket(
            pipe(
              ctx.puppeteer.getBrowserFirstPage("about:blank", {}),
              TE.mapLeft(toControllerError),
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
