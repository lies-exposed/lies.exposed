import { type Logger } from "@liexp/core/lib/logger";
import BotBrother, { type BotBrotherCtx, sessionManager } from "bot-brother";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/lib/function";
import type TelegramBot from "node-telegram-bot-api";

export interface TGBotProvider {
  bot: BotBrotherCtx;
  upsertPinnedMessage: (
    text: string
  ) => TE.TaskEither<Error, TelegramBot.Message>;
  post: (text: string) => TE.TaskEither<Error, any>;
  postPhoto: (image: string, caption: string) => TE.TaskEither<Error, any>;
  postMediaGroup: (
    text: string,
    media: readonly TelegramBot.InputMedia[]
  ) => TE.TaskEither<Error, TelegramBot.Message>;
  onMessage: (
    f: (message: TelegramBot.Message, metadata: TelegramBot.Metadata) => void
  ) => void;
  stopPolling: (
    opts?: TelegramBot.StopPollingOptions
  ) => TE.TaskEither<Error, void>;
}

export interface TGBotProviderOpts {
  token: string;
  chat: string;
  polling: boolean;
}

const toTGError = (e: unknown): Error => {
  return e as Error;
};

const liftTGTE = <A>(p: () => Promise<A>): TE.TaskEither<Error, A> => {
  return TE.tryCatch(p, toTGError);
};

export interface TGBotProviderCtx {
  logger: Logger;
}

export const TGBotProvider = (
  { logger }: TGBotProviderCtx,
  opts: TGBotProviderOpts
): TGBotProvider => {
  logger.debug.log("tg bot provider %O", opts);
  const bot = BotBrother({
    key: opts.token,
    sessionManager: sessionManager.memory(),
    polling: opts.polling,
  });

  return {
    bot,
    upsertPinnedMessage: (text) => {
      return pipe(
        liftTGTE(() => bot.api.getChat(opts.chat)),
        TE.map((c) => c.pinned_message),
        TE.chain((message) => {
          if (!message) {
            return pipe(
              liftTGTE(() => bot.api.sendMessage(opts.chat, text, {})),
              TE.chainFirst((m) =>
                liftTGTE(() => bot.api.pinChatMessage(opts.chat, m.message_id))
              )
            );
          } else {
            const te =
              text === message.text
                ? TE.right(message)
                : liftTGTE(() =>
                    bot.api.editMessageText(text, {
                      message_id: message.message_id,
                      chat_id: opts.chat,
                    })
                  );
            return pipe(
              te,
              TE.map(() => message)
            );
          }
        })
      );
    },
    post: (text) => {
      return liftTGTE(() =>
        bot.api.sendMessage(opts.chat, text, {
          parse_mode: "HTML",
          disable_web_page_preview: false,
        })
      );
    },
    postPhoto: (image, caption) => {
      return liftTGTE(() =>
        bot.api.sendPhoto(opts.chat, image, {
          caption,
          parse_mode: "HTML",
        })
      );
    },
    postMediaGroup(caption, media) {
      logger.debug.log("Post media group %O", media);
      return pipe(
        liftTGTE(() =>
          bot.api.sendMediaGroup(
            opts.chat,
            media.map((m) => ({ ...m, caption, parse_mode: "HTML" })),
            { disable_notification: true }
          )
        )
      );
    },
    onMessage: (f) => {
      bot.api.on("message", f);
    },
    stopPolling: (opts) => {
      return liftTGTE(
        () => bot.api?.stopPolling(opts) ?? Promise.resolve(undefined)
      );
    },
  };
};
