import { type WikipediaProvider } from "@liexp/backend/lib/providers/wikipedia/wikipedia.provider.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import { type Option } from "fp-ts/lib/Option.js";
import type TelegramBot from "node-telegram-bot-api";
import { findUserOrReplyFlow } from "../flows/tg/findUserOrReply.flow.js";
import { type WikiProviders } from "#flows/wikipedia/fetchFromWikipedia.js";
import { toControllerError } from "#io/ControllerError.js";
import { type RouteContext } from "#routes/route.types.js";
import { type TEControllerError } from "#types/TEControllerError.js";

const callbackQueryListeners: Record<
  string,
  (c: TelegramBot.CallbackQuery) => void
> = {};

interface EntityFromWikipediaServiceCtx<A> {
  chatId: number;
  fromId?: number;
  type: string;
  search: string;
  getIdentifier: (a: string) => string;
  findOne: (search: string) => TEControllerError<Option<A>>;
  fetchAndSave: (
    a: string,
    wikiProvider: WikiProviders,
  ) => TEControllerError<A>;
  getSuccessMessage: (a: A, baseUrl: string) => string;
}

type EntityFromWikipediaService = (
  ctx: RouteContext,
) => <A>(f: EntityFromWikipediaServiceCtx<A>) => TEControllerError<void>;

export const EntityFromWikipediaService: EntityFromWikipediaService =
  (ctx: RouteContext) =>
  <A>(api: EntityFromWikipediaServiceCtx<A>) => {
    ctx.logger.debug.log(`Search %O`, api.search);

    const identifier = api.getIdentifier(api.search);
    ctx.logger.debug.log("Looking for entity %s (%s)", api.type, identifier);

    const searchEntityOnWiki = (wiki: WikiProviders): TEControllerError<void> =>
      pipe(
        getWikiProvider(ctx)(wiki).search(api.search),
        fp.TE.map((q) =>
          q.slice(0, 5).concat({ pageid: -1, title: "Cancel" } as any),
        ),
        fp.TE.mapLeft(toControllerError),
        fp.TE.chain((options) => {
          const inlineKeyboardButtons = options.map((o) => [
            {
              text: o.title,
              callback_data: JSON.stringify({
                command: "actor",
                value: o.pageid,
              }),
            },
          ]);
          ctx.logger.debug.log("Inline keyboard %O", inlineKeyboardButtons);

          return fp.TE.tryCatch(
            () =>
              new Promise((resolve, reject) => {
                callbackQueryListeners[api.chatId] = (answer) => {
                  void pipe(
                    fp.TE.bracket(
                      fp.TE.right(ctx.tg.api),
                      (tg) => {
                        if (!answer.data) {
                          return fp.TE.right(undefined);
                        }
                        const pageId: number = JSON.parse(answer.data).value;
                        ctx.logger.debug.log("User pick %O", pageId);

                        if (pageId === -1) {
                          return fp.TE.left(
                            new Error(
                              `User canceled the search for ${api.search}`,
                            ),
                          );
                        }
                        ctx.logger.debug.log("Options in context %O", options);
                        const title = options.find(
                          (o) => o.pageid === pageId,
                        )?.title;

                        if (!title) {
                          return fp.TE.tryCatch(
                            () =>
                              tg.sendMessage(
                                api.chatId,
                                "Invalid option selected",
                              ),
                            toControllerError,
                          );
                        }

                        return pipe(
                          api.fetchAndSave(title, wiki),
                          fp.TE.chain((entity) =>
                            fp.TE.tryCatch(
                              () =>
                                tg.sendMessage(
                                  api.chatId,
                                  api.getSuccessMessage(
                                    entity,
                                    ctx.env.WEB_URL,
                                  ),
                                  {
                                    parse_mode: "HTML",
                                  },
                                ),
                              toControllerError,
                            ),
                          ),
                        );
                      },
                      (tg) => {
                        ctx.logger.debug.log(
                          "Removing chat %s listener",
                          api.chatId,
                        );
                        tg.removeListener(
                          "callback_query",
                          callbackQueryListeners[api.chatId],
                        );

                        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
                        delete callbackQueryListeners[api.chatId];

                        return fp.TE.right(undefined);
                      },
                    ),
                    throwTE,
                  )
                    .then(() => resolve())
                    .catch(reject);
                };

                ctx.tg.api.on(
                  "callback_query",
                  callbackQueryListeners[api.chatId],
                );

                void pipe(
                  fp.TE.tryCatch(
                    () =>
                      ctx.tg.api.sendMessage(
                        api.chatId,
                        `Results found on ${wiki}`,
                        {
                          reply_markup: {
                            inline_keyboard: inlineKeyboardButtons,
                          },
                        },
                      ),
                    toControllerError,
                  ),
                  throwTE,
                );
              }),
            toControllerError,
          );
        }),
      );

    return pipe(
      findUserOrReplyFlow(ctx)(() =>
        pipe(
          api.findOne(identifier),
          fp.TE.chain((g) => {
            if (fp.O.isSome(g)) {
              return fp.TE.tryCatch(
                () =>
                  ctx.tg.api
                    .sendMessage(
                      api.chatId,
                      api.getSuccessMessage(g.value, ctx.env.WEB_URL),
                      {
                        parse_mode: "HTML",
                      },
                    )
                    .then(() => undefined),
                toControllerError,
              );
            }

            return pipe(
              searchEntityOnWiki("wikipedia"),
              // fp.TE.orElse((err) => {
              //   ctx.logger.debug.log("wikipedia search failed %O", err);
              //   return coolTask("rationalwiki");
              // }),
              fp.TE.orElse((): TEControllerError<void> => {
                return pipe(
                  fp.TE.tryCatch(
                    () =>
                      ctx.tg.api.sendMessage(api.chatId, "No results found"),
                    toControllerError,
                  ),
                  fp.TE.map(() => undefined),
                );
              }),
            );
          }),
        ),
      )(api.chatId, api.fromId),
    );
  };

export const getWikiProvider =
  (ctx: RouteContext) =>
  (type: WikiProviders): WikipediaProvider =>
    type === "wikipedia" ? ctx.wp : ctx.rw;
