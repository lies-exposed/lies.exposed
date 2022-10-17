import * as TE from "fp-ts/TaskEither";
import TelegramBot from "node-telegram-bot-api";

const chatId = "@lies_exposed";

export interface TGBotProvider {
  bot: TelegramBot;
  post: (test: string) => TE.TaskEither<Error, any>;
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

export const TGBotProvider = (opts: TGBotProviderOpts): TGBotProvider => {
  const bot = new TelegramBot(opts.token, { polling: opts.polling });

  return {
    bot,
    post: (text) => {
      return TE.tryCatch(
        () =>
          bot.sendMessage(chatId, text, {
            parse_mode: "HTML",
            disable_web_page_preview: false,
          }),
        toTGError
      );
    },
    postPhoto: (image, caption) => {
      return TE.tryCatch(
        () =>
          bot.sendPhoto(chatId, image, {
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
