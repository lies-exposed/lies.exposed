import { type Readable } from "stream";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { type Logger } from "@liexp/core/lib/logger/index.js";
import { PDFType } from "@liexp/io/lib/http/Media/MediaType.js";
import type { HTTPError } from "@liexp/shared/lib/providers/http/http.provider.js";
import { IOError } from "@ts-endpoint/core";
import type { AxiosRequestConfig } from "axios";
import * as TE from "fp-ts/lib/TaskEither.js";
import {
  type Bot,
  type BotOptions,
  TelegramApiError,
  type CallbackQuery,
  type File,
  type InputMedia,
  type Message,
  type SendVideoParams,
  type Api,
} from "node-telegram-bot-api";

export interface TGBotProvider {
  api: Api;
  upsertPinnedMessage: (text: string) => TE.TaskEither<Error, Message>;
  post: (
    text: string,
    replyToMessageId?: number,
  ) => TE.TaskEither<Error, Message>;
  postPhoto: (
    imageUrl: string,
    caption: string,
  ) => TE.TaskEither<Error, Message>;
  postVideo: (
    videoUrl: string,
    caption: string,
    opts?: Omit<
      SendVideoParams,
      "chat_id" | "video" | "caption" | "parse_mode"
    >,
  ) => TE.TaskEither<Error, Message>;
  postMediaGroup: (
    caption: string,
    media: readonly InputMedia[],
  ) => TE.TaskEither<Error, Message[]>;
  postFile: (
    text: string,
    fileName: string,
    file: string,
    contentType?: PDFType,
  ) => TE.TaskEither<Error, Message>;
  onMessage: (f: (message: Message) => void) => void;
  onText: (
    regex: RegExp,
    f: (message: Message, match: RegExpExecArray | null) => void,
  ) => void;
  onCallbackQuery: (f: (query: CallbackQuery) => void) => void;
  onError: (f: (err: Error) => void) => void;
  stopPolling: () => TE.TaskEither<Error, void>;

  getFileStream: <F extends File>(file: F) => TE.TaskEither<Error, Readable>;
}

export interface TGBotProviderOpts {
  token: string;
  chat: string;
  polling: boolean;
  baseApiUrl: string;
}

export class TGError extends IOError {
  name = "TGError";
  code?: string;
  description?: string;
}

export const toTGError = (e: unknown): TGError => {
  if (e instanceof TelegramApiError) {
    const error = new TGError(e.message, {
      kind: "ClientError",
      status: String(e.errorCode ?? 500),
      meta: { parameters: e.parameters },
    });
    error.code = "ETELEGRAM";
    error.description = e.message;
    return error;
  }
  return new TGError("Unknown telegram error", {
    kind: "ServerError",
    status: "500",
    meta: e,
  });
};

const liftTGTE = <A>(p: () => Promise<A>): TE.TaskEither<TGError, A> => {
  return TE.tryCatch(p, toTGError);
};

export interface TGBotProviderCtx {
  client: (token: string, options?: BotOptions) => Bot;
  logger: Logger;
  http: {
    get: <T>(
      url: string,
      config?: AxiosRequestConfig,
    ) => TE.TaskEither<HTTPError, T>;
  };
}

export const TGBotProvider = (
  { client, logger, http }: TGBotProviderCtx,
  opts: TGBotProviderOpts,
): TGBotProvider => {
  const encryptedToken = opts.token
    .split(":")
    .map((s) =>
      s.substring(0, 3).concat(
        Array.from({ length: s.length - 4 })
          .map(() => "x")
          .join(""),
      ),
    )
    .join(":");

  logger.debug.log("tg bot provider %O", {
    ...opts,
    token: encryptedToken,
  });
  // v2 has no setApiUrl: the API origin is a constructor option, and an
  // empty value falls back to https://api.telegram.org.
  const bot = client(opts.token, { apiRoot: opts.baseApiUrl });

  return {
    api: bot.api,
    getFileStream: (file) => {
      const fileSizeInMB = Math.ceil((file.file_size ?? 1) / 1000 / 1000);
      logger.debug.log(
        "Download video file from TG %s (%d)MB",
        file.file_id,
        fileSizeInMB,
      );

      return pipe(
        liftTGTE(() => bot.api.getFile({ file_id: file.file_id })),
        TE.chain((result) => {
          const filePath = result.file_path;
          if (!filePath) {
            return TE.left(
              new TGError("No file_path returned from Telegram", {
                kind: "ClientError",
                status: "500",
                meta: { file_id: file.file_id },
              }),
            );
          }
          const url = `https://api.telegram.org/file/bot${opts.token}/${filePath}`;
          return pipe(
            http.get<Readable>(url, {
              responseType: "stream",
            }),
            TE.mapLeft(
              () =>
                new TGError("Failed to download file", {
                  kind: "ClientError",
                  status: "500",
                  meta: { file_id: file.file_id },
                }),
            ),
          );
        }),
      );
    },
    upsertPinnedMessage: (text) => {
      return pipe(
        liftTGTE(() => bot.api.getChat({ chat_id: opts.chat })),
        TE.map((c) => c.pinned_message),
        TE.chain((message) => {
          if (!message) {
            return pipe(
              liftTGTE(() =>
                bot.api.sendMessage({
                  chat_id: opts.chat,
                  text,
                }),
              ),
              TE.chainFirst((m) =>
                liftTGTE(() =>
                  bot.api.pinChatMessage({
                    chat_id: opts.chat,
                    message_id: m.message_id,
                  }),
                ),
              ),
            );
          } else {
            const te =
              text === message.text
                ? TE.right(message)
                : liftTGTE(() =>
                    bot.api.editMessageText({
                      text,
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
    post: (text, replyToMessageId) => {
      return liftTGTE(() =>
        bot.api.sendMessage({
          chat_id: opts.chat,
          text,
          reply_parameters: replyToMessageId
            ? { message_id: replyToMessageId }
            : undefined,
          parse_mode: "HTML",
        }),
      );
    },
    postPhoto: (image, caption) => {
      return liftTGTE(() =>
        bot.api.sendPhoto({
          chat_id: opts.chat,
          photo: image,
          caption,
          parse_mode: "HTML",
        }),
      );
    },
    postVideo: (videoUrl, caption, videoOpts) => {
      return liftTGTE(() =>
        bot.api.sendVideo({
          chat_id: opts.chat,
          video: videoUrl,
          caption,
          parse_mode: "HTML",
          ...videoOpts,
        }),
      );
    },
    postMediaGroup(caption, media) {
      logger.debug.log("Post media group %O", media);
      return pipe(
        liftTGTE(() =>
          bot.api.sendMediaGroup({
            chat_id: opts.chat,
            media: media.map((m) => ({ ...m, caption, parse_mode: "HTML" })),
          }),
        ),
      );
    },
    postFile(text, filename, file, _contentType = PDFType.literals[0]) {
      return liftTGTE(() =>
        bot.api.sendDocument({
          chat_id: opts.chat,
          document: file,
          caption: text,
          parse_mode: "HTML",
        }),
      );
    },
    onMessage: (f) => {
      bot.on("message", (ctx) => {
        // v2 middleware context has message and metadata
        const msg = ctx.message!;
        f(msg);
      });
    },
    onText: (regex, f) => {
      bot.hears(regex, (ctx) => {
        const msg = ctx.message!;
        const match = msg.text?.match(regex);
        f(msg, match as RegExpExecArray | null);
      });
    },
    onCallbackQuery: (f) => {
      bot.on("callback_query", (ctx) => {
        f(ctx.callbackQuery!);
      });
    },
    onError: (f) => {
      bot.catch((err) => {
        f(err instanceof Error ? err : new Error(String(err)));
      });
    },
    stopPolling: () => {
      return liftTGTE(() => bot.stop() ?? Promise.resolve(undefined));
    },
  };
};
