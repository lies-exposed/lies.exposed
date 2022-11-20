import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/lib/function";
import TelegramBot from "node-telegram-bot-api";

export interface TGBotProvider {
  bot: TelegramBot;
  upsertPinnedMessage: (
    text: string
  ) => TE.TaskEither<Error, TelegramBot.Message>;
  post: (text: string) => TE.TaskEither<Error, any>;
  postPhoto: (image: string, caption: string) => TE.TaskEither<Error, any>;
  onMessage: (
    f: (message: TelegramBot.Message, metadata: TelegramBot.Metadata) => void
  ) => void;
  stopPolling: (
    opts: TelegramBot.StopPollingOptions
  ) => TE.TaskEither<Error, void>;
}

interface TGBotProviderOpts {
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

export const TGBotProvider = (opts: TGBotProviderOpts): TGBotProvider => {
  const bot = new TelegramBot(opts.token, { polling: opts.polling });

  return {
    bot,
    upsertPinnedMessage: (text) => {
      return pipe(
        liftTGTE(() => bot.getChat(opts.chat)),
        TE.map((c) => c.pinned_message),
        TE.chain((message) => {
          if (!message) {
            return pipe(
              liftTGTE(() => bot.sendMessage(opts.chat, text, {})),
              TE.chainFirst((m) =>
                liftTGTE(() => bot.pinChatMessage(opts.chat, m.message_id))
              )
            );
          } else {
            const te =
              text === message.text
                ? TE.right(message)
                : liftTGTE(() =>
                    bot.editMessageText(text, {
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
      return TE.tryCatch(
        () =>
          bot.sendMessage(opts.chat, text, {
            parse_mode: "HTML",
            disable_web_page_preview: false,
          }),
        toTGError
      );
    },
    postPhoto: (image, caption) => {
      return TE.tryCatch(
        () =>
          bot.sendPhoto(opts.chat, image, {
            caption,
            parse_mode: "HTML",
          }),
        toTGError
      );
    },
    onMessage: (
      f: (message: TelegramBot.Message, metadata: TelegramBot.Metadata) => void
    ) => {
      bot.on("message", f);
    },
    stopPolling: (opts: TelegramBot.StopPollingOptions) => {
      return TE.tryCatch(() => bot.stopPolling(opts), toTGError);
    },
  };
};
