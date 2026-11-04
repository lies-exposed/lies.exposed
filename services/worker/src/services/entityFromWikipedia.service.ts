import { UserEntity } from "@liexp/backend/lib/entities/User.entity.js";
import { type WikiProviders } from "@liexp/backend/lib/providers/wikipedia/types.js";
import { type WikipediaProvider } from "@liexp/backend/lib/providers/wikipedia/wikipedia.provider.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type Option } from "fp-ts/lib/Option.js";
import type * as TE from "fp-ts/lib/TaskEither.js";
import {
  type CallbackQuery,
  type InlineKeyboardMarkup,
} from "node-telegram-bot-api";
import { type RTE } from "../types.js";
import { type WorkerContext } from "#context/context.js";
import { toWorkerError, type WorkerError } from "#io/worker.error.js";

// Store pending callback handlers keyed by chatId
const callbackQueryHandlers: Record<string, (query: CallbackQuery) => void> =
  {};

interface EntityFromWikipediaServiceCtx<A> {
  chatId: number;
  fromId?: number;
  type: string;
  search: string;
  getIdentifier: (a: string) => string;
  // Already a TE, no ctx needed
  findOne: (search: string) => TE.TaskEither<WorkerError, Option<A>>;
  // Needs ctx to invoke, returns TE<A>
  fetchAndSave: (
    a: string,
    wikiProvider: WikiProviders,
  ) => (ctx: WorkerContext) => TE.TaskEither<WorkerError, A>;
  getSuccessMessage: (a: A, baseUrl: string) => string;
}

type EntityFromWikipediaService = <A>(
  f: EntityFromWikipediaServiceCtx<A>,
) => RTE<void>;

const cleanupCallbackHandler = (chatId: number) => {
  delete callbackQueryHandlers[String(chatId)];
};

export const EntityFromWikipediaService: EntityFromWikipediaService =
  <A>(api: EntityFromWikipediaServiceCtx<A>) =>
  (ctx) => {
    ctx.logger.debug.log(`Search %O`, api.search);

    const identifier = api.getIdentifier(api.search);
    ctx.logger.debug.log("Looking for entity %s (%s)", api.type, identifier);

    // Step 1: Check if user exists and is allowed
    const checkUser = api.fromId
      ? pipe(
          ctx.db.findOne(UserEntity, {
            where: { telegramId: String(api.fromId) },
          }),
          fp.TE.mapLeft((e) => toWorkerError(e)),
        )
      : fp.TE.right(fp.O.none);

    return pipe(
      checkUser,
      fp.TE.chain((userOpt) => {
        if (fp.O.isNone(userOpt)) {
          return pipe(
            ctx.tg.post("You are not allowed to create actors"),
            fp.TE.mapLeft((e) => toWorkerError(e)),
            fp.TE.map(() => undefined),
          );
        }

        // Step 2: Try to find existing entity
        return pipe(
          api.findOne(identifier),
          fp.TE.chain((found) => {
            if (fp.O.isSome(found)) {
              return pipe(
                ctx.tg.post(
                  api.getSuccessMessage(found.value, ctx.env.WEB_URL),
                ),
                fp.TE.mapLeft((e) => toWorkerError(e)),
                fp.TE.map(() => undefined),
              );
            }

            // Step 3: Search on Wikipedia
            return pipe(
              ctx.wp.search(api.search),
              fp.TE.map((results) =>
                results.slice(0, 5).concat({
                  pageid: -1,
                  title: "Cancel",
                  ns: 0,
                  timestamp: new Date().toISOString(),
                }),
              ),
              fp.TE.mapLeft((e) => toWorkerError(e)),
              fp.TE.chain((options) => {
                const inlineKeyboardButtons: InlineKeyboardMarkup["inline_keyboard"] =
                  options.map((o) => [
                    {
                      text: o.title,
                      callback_data: JSON.stringify({
                        command: api.type,
                        value: o.pageid,
                      }),
                    },
                  ]);

                // Set up the callback handler
                callbackQueryHandlers[String(api.chatId)] = (answer) => {
                  void (async () => {
                    try {
                      if (!answer.data || typeof answer.data !== "string") {
                        cleanupCallbackHandler(api.chatId);
                        return;
                      }

                      const parsed = JSON.parse(answer.data);
                      const pageId = parsed.value as number | null;
                      if (pageId === null) {
                        cleanupCallbackHandler(api.chatId);
                        return;
                      }

                      if (pageId === -1) {
                        cleanupCallbackHandler(api.chatId);
                        return;
                      }

                      const found = options.find((o) => o.pageid === pageId);
                      if (!found?.title) {
                        cleanupCallbackHandler(api.chatId);
                        return;
                      }

                      const result = await api.fetchAndSave(
                        found.title,
                        "wikipedia",
                      )(ctx)();
                      const entity = pipe(
                        result,
                        fp.E.fold(
                          (e) => {
                            ctx.logger.error.log("Fetch error: %O", e);
                            return undefined as unknown as A;
                          },
                          (a) => a,
                        ),
                      );
                      if (!entity) {
                        cleanupCallbackHandler(api.chatId);
                        return;
                      }
                      await ctx.tg.api.sendMessage({
                        chat_id: api.chatId,
                        text: api.getSuccessMessage(entity, ctx.env.WEB_URL),
                        parse_mode: "HTML",
                      });
                    } catch (e) {
                      ctx.logger.error.log("Callback error: %O", e);
                    } finally {
                      cleanupCallbackHandler(api.chatId);
                    }
                  })();
                };

                // Post message with inline keyboard
                void ctx.tg.api
                  .sendMessage({
                    chat_id: api.chatId,
                    text: `Results found on wikipedia`,
                    reply_markup: {
                      inline_keyboard: inlineKeyboardButtons,
                    },
                  })
                  .catch(() => {
                    ctx.logger.error.log("Failed to send inline keyboard");
                  });

                return fp.TE.right(undefined);
              }),
            );
          }),
        );
      }),
    );
  };

export const getWikiProvider =
  (type: WikiProviders) =>
  (ctx: WorkerContext): WikipediaProvider =>
    type === "wikipedia" ? ctx.wp : ctx.rw;
