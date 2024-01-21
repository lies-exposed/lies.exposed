import { type TGBotProvider } from "@liexp/backend/lib/providers/tg/tg.provider.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import kebabCase from "lodash/kebabCase.js";
import type TelegramBot from "node-telegram-bot-api";
import { findUserOrReplyFlow } from "./helpers/findUserOrReply.js";
import { ActorEntity } from "#entities/Actor.entity.js";
import { fetchAndCreateActorFromWikipedia } from "#flows/actors/fetchAndCreateActorFromWikipedia.js";
import { toControllerError } from "#io/ControllerError.js";
import { type RouteContext } from "#routes/route.types.js";

const getSuccessMessage = (actor: ActorEntity, baseUrl: string): string =>
  `Actor <a href="${baseUrl}/actors/${actor.id}">${actor.fullName}</a>`;

const callbackQueryListeners: Record<
  string,
  (c: TelegramBot.CallbackQuery) => void
> = {};

export const actorCommand = (ctx: RouteContext): TGBotProvider => {
  ctx.tg.api.onText(/\/actor\s(.*)/, (msg, match) => {
    if (!match || match[1] === "") {
      return;
    }

    ctx.logger.debug.log(`Match %O`, match);
    const userId = msg.from?.id;
    const commandContext: any = {};

    commandContext.search = match[1];
    const username = kebabCase(commandContext.search);
    ctx.logger.debug.log(
      "Looking for actor %s (%s)",
      commandContext.search,
      username,
    );

    void pipe(
      findUserOrReplyFlow(ctx)((user) =>
        pipe(
          ctx.db.findOne(ActorEntity, { where: { username } }),
          fp.TE.chain((a) => {
            if (fp.O.isSome(a)) {
              return pipe(
                fp.TE.tryCatch(
                  () =>
                    ctx.tg.api.sendMessage(
                      msg.chat.id,
                      getSuccessMessage(a.value, ctx.env.WEB_URL),
                    ),
                  toControllerError,
                ),
              );
            }
            return pipe(
              ctx.wp.search(commandContext.search),
              fp.TE.mapLeft(toControllerError),
              fp.TE.map((q) =>
                q.results.slice(0, 5).map((s) => ({
                  [s.title]: { value: s.pageid },
                })),
              ),
              fp.TE.chain((options) => {
                const inlineKeyboardButtons = options.map((o) =>
                  Object.entries(o).map(([name, v]) => ({
                    text: name,
                    callback_data: JSON.stringify({
                      command: "actor",
                      value: v.value,
                    }),
                  })),
                );

                callbackQueryListeners[msg.chat.id] = (answer) => {
                  if (!answer.data) {
                    return;
                  }
                  const jsonData = JSON.parse(answer.data);
                  ctx.logger.debug.log("User pick %O", jsonData);

                  void pipe(
                    fetchAndCreateActorFromWikipedia(ctx)(jsonData.value),
                    fp.TE.chain((actor) =>
                      fp.TE.tryCatch(
                        () =>
                          ctx.tg.api.sendMessage(
                            msg.chat.id,
                            getSuccessMessage(actor, ctx.env.WEB_URL),
                            {
                              parse_mode: "HTML",
                            },
                          ),
                        toControllerError,
                      ),
                    ),
                    fp.TE.chainFirst(() => {
                      ctx.tg.api.removeListener(
                        "callback_query",
                        callbackQueryListeners[msg.chat.id],
                      );

                      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
                      delete callbackQueryListeners[msg.chat.id];
                      return fp.TE.right(undefined);
                    }),
                    throwTE,
                  );
                };

                ctx.tg.api.on(
                  "callback_query",
                  callbackQueryListeners[msg.chat.id],
                );

                return fp.TE.tryCatch(
                  () =>
                    ctx.tg.api.sendMessage(
                      msg.chat.id,
                      "Select one of the result",
                      {
                        reply_markup: {
                          inline_keyboard: inlineKeyboardButtons,
                        },
                      },
                    ),
                  toControllerError,
                );
              }),
            );
          }),
          fp.TE.map(() => undefined),
        ),
      )(msg.chat.id, userId),
      throwTE,
    );
  });

  return ctx.tg;
};
