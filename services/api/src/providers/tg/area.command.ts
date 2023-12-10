import { type TGBotProvider } from "@liexp/backend/lib/providers/tg/tg.provider.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type Area } from "@liexp/shared/lib/io/http/index.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import kebabCase from "lodash/kebabCase.js";
import type TelegramBot from "node-telegram-bot-api";
import { AreaEntity } from "#entities/Area.entity.js";
import { fetchAreaFromWikipedia } from "#flows/areas/fetchAreaFromWikipedia.js";
import { toControllerError } from "#io/ControllerError.js";
import { toAreaIO } from "#routes/areas/Area.io.js";
import { type RouteContext } from "#routes/route.types.js";

const getSuccessMessage = (area: Area.Area, baseUrl: string): string =>
  `Area <a href="${baseUrl}/areas/${area.id}">${area.label}</a>`;

const callbackQueryListeners: Record<
  string,
  (c: TelegramBot.CallbackQuery) => void
> = {};

export const areaCommand = ({
  logger,
  wp,
  tg,
  db,
  env,
  ...rest
}: RouteContext): TGBotProvider => {
  tg.api.onText(/\/area\s(.*)/, (msg, match) => {
    if (!match || match[1] === "") {
      return;
    }

    logger.debug.log(`Area match %O`, match);
    const commandContext: any = {};

    commandContext.search = match[1];
    const label = kebabCase(commandContext.search);
    logger.debug.log("Looking for area %s (%s)", commandContext.search, label);

    void pipe(
      db.findOne(AreaEntity, { where: { label } }),
      fp.TE.chain((a) => {
        if (fp.O.isSome(a)) {
          return pipe(
            fp.TE.fromEither(toAreaIO(a.value)),
            fp.TE.chain((area) =>
              fp.TE.tryCatch(
                () =>
                  tg.api.sendMessage(
                    msg.chat.id,
                    getSuccessMessage(area, env.WEB_URL),
                  ),
                toControllerError,
              ),
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
                  command: "area",
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
                fetchAreaFromWikipedia({
                  db,
                  logger,
                  wp,
                  tg,
                  env,
                  ...rest,
                })(jsonData.value),
                fp.TE.chain(({ area }) =>
                  fp.TE.tryCatch(
                    () =>
                      tg.api.sendMessage(
                        msg.chat.id,
                        getSuccessMessage(area, env.WEB_URL),
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
    ).catch((e) => {
      logger.error.log(`Failed to create area: %O`, e);
    });
  });

  return tg;
};
