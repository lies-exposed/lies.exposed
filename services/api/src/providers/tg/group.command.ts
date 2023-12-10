import { type TGBotProvider } from "@liexp/backend/lib/providers/tg/tg.provider.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { getUsernameFromDisplayName } from "@liexp/shared/lib/helpers/actor.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import type TelegramBot from "node-telegram-bot-api";
import { GroupEntity } from "#entities/Group.entity.js";
import { fetchGroupFromWikipedia } from "#flows/groups/fetchGroupFromWikipedia.js";
import { toControllerError } from "#io/ControllerError.js";
import { type RouteContext } from "#routes/route.types.js";

const getSuccessMessage = (g: GroupEntity, baseUrl: string): string =>
  `Group <a href="${baseUrl}/group/${g.id}">${g.name}</a>`;

const callbackQueryListeners: Record<
  string,
  (c: TelegramBot.CallbackQuery) => void
> = {};

export const groupCommand = ({
  logger,
  db,
  wp,
  tg,
  env,
  ...tgContext
}: RouteContext): TGBotProvider => {
  const handleGroupMessage = async (
    msg: TelegramBot.Message,
    match: RegExpExecArray | null,
  ): Promise<void> => {
    if (!match || match[1] === "") {
      return;
    }

    logger.debug.log(`Match %O`, match);
    const commandContext: any = {};

    commandContext.search = match[1];
    const username = getUsernameFromDisplayName(commandContext.search);
    logger.debug.log("/group %s", commandContext.search, username);

    void pipe(
      db.findOne(GroupEntity, { where: { username } }),
      fp.TE.chain((g) => {
        if (fp.O.isSome(g)) {
          return fp.TE.tryCatch(
            () =>
              tg.api.sendMessage(
                msg.chat.id,
                getSuccessMessage(g.value, env.WEB_URL),
                {
                  parse_mode: "HTML",
                },
              ),
            toControllerError,
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
              const pageId = jsonData.value;

              void pipe(
                fetchGroupFromWikipedia({
                  logger,
                  wp,
                  tg,
                  db,
                  env,
                  ...tgContext,
                })(pageId),
                fp.TE.chain((groupData) =>
                  db.save(GroupEntity, [{ ...groupData, members: [] }]),
                ),
                fp.TE.chain(([group]) =>
                  fp.TE.tryCatch(
                    () =>
                      tg.api.sendMessage(
                        msg.chat.id,
                        getSuccessMessage(group, env.WEB_URL),
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
                tg.api.sendMessage(msg.chat.id, "Results found on Wikipedia", {
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
  };

  tg.api.onText(/\/group\s(.*)/, (msg, match) => {
    void handleGroupMessage(msg, match);
  });

  return tg;
};
