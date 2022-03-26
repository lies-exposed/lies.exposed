import * as TE from "fp-ts/lib/TaskEither";
import TelegramBot from "node-telegram-bot-api";

const chatId = "@lies_exposed";

export interface TGBotProvider {
  post: (test: string) => TE.TaskEither<Error, any>;
  postPhoto: (image: string, caption: string) => TE.TaskEither<Error, any>;
}

interface TGBotProviderOpts {
  token: string;
  chat: string;
}

const toTGError = (e: unknown): Error => {
  return e as Error;
};

export const TGBotProvider = (opts: TGBotProviderOpts): TGBotProvider => {
  const bot = new TelegramBot(opts.token, { polling: false });

  return {
    post: (text) => {
      return TE.tryCatch(
        () =>
          bot.sendMessage(chatId, text, {
            parse_mode: "HTML",
            disable_web_page_preview: false
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
  };
};
