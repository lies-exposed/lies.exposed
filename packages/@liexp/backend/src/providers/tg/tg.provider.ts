import { type Logger } from "@liexp/core/lib/logger";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import TelegramBot from "node-telegram-bot-api";

export interface TGBotProvider {
  api: TelegramBot;
  upsertPinnedMessage: (
    text: string,
  ) => TE.TaskEither<Error, TelegramBot.Message>;
  post: (text: string) => TE.TaskEither<Error, any>;
  postPhoto: (imageUrl: string, caption: string) => TE.TaskEither<Error, any>;
  postVideo: (videoUrl: string, caption: string) => TE.TaskEither<Error, any>;
  postMediaGroup: (
    text: string,
    media: readonly TelegramBot.InputMedia[],
  ) => TE.TaskEither<Error, TelegramBot.Message>;
  onMessage: (
    f: (message: TelegramBot.Message, metadata: TelegramBot.Metadata) => void,
  ) => void;
  stopPolling: (
    opts?: TelegramBot.StopPollingOptions,
  ) => TE.TaskEither<Error, void>;
}

export interface TGBotProviderOpts {
  token: string;
  chat: string;
  polling: boolean;
  baseApiUrl: string;
}

const toTGError = (e: unknown): Error => {
  if (e) {
    const errorAny: any = e;
    if (errorAny.code === "ETELEGRAM") {
      return errorAny.toJSON();
    }
  }
  return new Error("Unknown telegram error", { cause: e });
};

const liftTGTE = <A>(p: () => Promise<A>): TE.TaskEither<Error, A> => {
  return TE.tryCatch(p, toTGError);
};

export interface TGBotProviderCtx {
  logger: Logger;
}

export const TGBotProvider = (
  { logger }: TGBotProviderCtx,
  opts: TGBotProviderOpts,
): TGBotProvider => {
  logger.debug.log("tg bot provider %O", opts);
  const api = new TelegramBot(opts.token, {
    polling: opts.polling,
    baseApiUrl: opts.baseApiUrl,
  });

  return {
    api,
    upsertPinnedMessage: (text) => {
      return pipe(
        liftTGTE(() => api.getChat(opts.chat)),
        TE.map((c) => c.pinned_message),
        TE.chain((message) => {
          if (!message) {
            return pipe(
              liftTGTE(() => api.sendMessage(opts.chat, text, {})),
              TE.chainFirst((m) =>
                liftTGTE(() => api.pinChatMessage(opts.chat, m.message_id)),
              ),
            );
          } else {
            const te =
              text === message.text
                ? TE.right(message)
                : liftTGTE(() =>
                    api.editMessageText(text, {
                      message_id: message.message_id,
                      chat_id: opts.chat,
                    }),
                  );
            return pipe(
              te,
              TE.map(() => message),
            );
          }
        }),
      );
    },
    post: (text) => {
      return liftTGTE(() =>
        api.sendMessage(opts.chat, text, {
          parse_mode: "HTML",
          disable_web_page_preview: false,
        }),
      );
    },
    postPhoto: (image, caption) => {
      return liftTGTE(() =>
        api.sendPhoto(opts.chat, image, {
          caption,
          parse_mode: "HTML",
        }),
      );
    },
    postVideo: (image, caption) => {
      return liftTGTE(() =>
        api.sendVideo(opts.chat, image, {
          caption,
          parse_mode: "HTML",
        }),
      );
    },
    postMediaGroup(caption, media) {
      logger.debug.log("Post media group %O", media);
      return pipe(
        liftTGTE(() =>
          api.sendMediaGroup(
            opts.chat,
            media.map((m) => ({ ...m, caption, parse_mode: "HTML" })),
            { disable_notification: true },
          ),
        ),
      );
    },
    onMessage: (f) => {
      api.on("message", f);
    },
    stopPolling: (opts) => {
      return liftTGTE(
        () => api.stopPolling(opts) ?? Promise.resolve(undefined),
      );
    },
  };
};
