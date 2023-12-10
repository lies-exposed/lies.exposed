import { type TGBotProvider } from "@liexp/backend/lib/providers/tg/tg.provider.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import kebabCase from "lodash/kebabCase.js";
import type TelegramBot from "node-telegram-bot-api";
import { ActorEntity } from "#entities/Actor.entity.js";
import { fetchActorFromWikipedia } from "#flows/actors/fetchActorFromWikipedia.js";
import { toControllerError } from "#io/ControllerError.js";
import { type RouteContext } from "#routes/route.types.js";

const getSuccessMessage = (actor: ActorEntity, baseUrl: string): string =>
  `Actor <a href="${baseUrl}/actors/${actor.id}">${actor.fullName}</a>`;

const callbackQueryListeners: Record<
  string,
  (c: TelegramBot.CallbackQuery) => void
> = {};

export const actorCommand = ({
  logger,
  wp,
  tg,
  db,
  env,
  ...rest
}: RouteContext): TGBotProvider => {
  tg.api.onText(/\/actor\s(.*)/, (msg, match) => {
    if (!match || match[1] === "") {
      return;
    }

    logger.debug.log(`Match %O`, match);
    const commandContext: any = {};

    commandContext.search = match[1];
    const username = kebabCase(commandContext.search);
    logger.debug.log(
      "Looking for actor %s (%s)",
      commandContext.search,
      username,
    );

    void pipe(
      db.findOne(ActorEntity, { where: { username } }),
      fp.TE.chain((a) => {
        if (fp.O.isSome(a)) {
          return pipe(
            fp.TE.tryCatch(
              () =>
                tg.api.sendMessage(
                  msg.chat.id,
                  getSuccessMessage(a.value, env.WEB_URL),
                ),
              toControllerError,
            ),
          );
        }
        return pipe(
          wp.search(commandContext.search),
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
              logger.debug.log("User pick %O", jsonData);

              void pipe(
                fetchActorFromWikipedia({
                  db,
                  logger,
                  wp,
                  tg,
                  env,
                  ...rest,
                })(jsonData.value),
                fp.TE.chain((actorData) => {
                  return pipe(
                    db.findOne(ActorEntity, {
                      where: { username: actorData.username },
                    }),
                    fp.TE.chain((a) => {
                      if (fp.O.isSome(a)) {
                        return fp.TE.right([a.value]);
                      }

                      return db.save(ActorEntity, [
                        {
                          ...actorData,
                          bornOn: actorData.bornOn as any,
                          diedOn: actorData.diedOn as any,
                        },
                      ]);
                    }),
                  );
                }),
                fp.TE.chain(([actor]) =>
                  fp.TE.tryCatch(
                    () =>
                      tg.api.sendMessage(
                        msg.chat.id,
                        getSuccessMessage(actor, env.WEB_URL),
                        {
                          parse_mode: "HTML",
                        },
                      ),
                    toControllerError,
                  ),
                ),
                fp.TE.chainFirst(() => {
                  tg.api.removeListener(
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

            tg.api.on("callback_query", callbackQueryListeners[msg.chat.id]);

            return fp.TE.tryCatch(
              () =>
                tg.api.sendMessage(msg.chat.id, "Select one of the result", {
                  reply_markup: {
                    inline_keyboard: inlineKeyboardButtons,
                  },
                }),
              toControllerError,
            );
          }),
        );
      }),
      throwTE,
    );
  });

  return tg;
};
