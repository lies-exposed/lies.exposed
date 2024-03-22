import { type TGBotProvider } from "@liexp/backend/lib/providers/tg/tg.provider.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type Area } from "@liexp/shared/lib/io/http/index.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import kebabCase from "lodash/kebabCase.js";
import type TelegramBot from "node-telegram-bot-api";
import { findUserOrReplyFlow } from "./helpers/findUserOrReply.js";
import { AreaEntity } from "#entities/Area.entity.js";
import { fetchAndCreateAreaFromWikipedia } from "#flows/areas/fetchAndCreateAreaFromWikipedia.js";
import { toControllerError } from "#io/ControllerError.js";
import { toAreaIO } from "#routes/areas/Area.io.js";
import { type RouteContext } from "#routes/route.types.js";

const getSuccessMessage = (area: Area.Area, baseUrl: string): string =>
  `Area <a href="${baseUrl}/areas/${area.id}">${area.label}</a>`;

const callbackQueryListeners: Record<
  string,
  (c: TelegramBot.CallbackQuery) => void
> = {};

export const areaCommand = (ctx: RouteContext): TGBotProvider => {
  ctx.tg.api.onText(/\/area\s(.*)/, (msg, match) => {
    if (!match || match[1] === "") {
      return;
    }

    ctx.logger.debug.log(`Area match %O`, match);
    const commandContext: any = {};

    commandContext.search = match[1];
    const label = kebabCase(commandContext.search);
    ctx.logger.debug.log(
      "Looking for area %s (%s)",
      commandContext.search,
      label,
    );

    void pipe(
      findUserOrReplyFlow(ctx)((user) =>
        pipe(
          ctx.db.findOne(AreaEntity, { where: { label } }),
          fp.TE.chain((a) => {
            if (fp.O.isSome(a)) {
              return pipe(
                fp.TE.fromEither(toAreaIO(a.value, ctx.env.SPACE_ENDPOINT)),
                fp.TE.chain((area) =>
                  fp.TE.tryCatch(
                    () =>
                      ctx.tg.api.sendMessage(
                        msg.chat.id,
                        getSuccessMessage(area, ctx.env.WEB_URL),
                      ),
                    toControllerError,
                  ),
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
                  ctx.logger.debug.log("User pick %O", jsonData);

                  void pipe(
                    fetchAndCreateAreaFromWikipedia(ctx)(jsonData.value),
                    fp.TE.chain(({ area }) =>
                      fp.TE.tryCatch(
                        () =>
                          ctx.tg.api.sendMessage(
                            msg.chat.id,
                            getSuccessMessage(area, ctx.env.WEB_URL),
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
      )(msg.chat.id, msg.from?.id),
      throwTE,
    ).catch((e) => {
      ctx.logger.error.log(`Failed to create area: %O`, e);
    });
  });

  return ctx.tg;
};
