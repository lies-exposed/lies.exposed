import { GroupEntity } from "@liexp/backend/lib/entities/Group.entity.js";
import { type TGBotProvider } from "@liexp/backend/lib/providers/tg/tg.provider.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { getUsernameFromDisplayName } from "@liexp/shared/lib/helpers/actor.js";
import { GROUPS } from "@liexp/shared/lib/io/http/Group.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import type TelegramBot from "node-telegram-bot-api";
import { type WorkerContext } from "#context/context.js";
import { fetchAndCreateGroupFromWikipedia } from "#flows/group/fetchGroupFromWikipedia.js";
import { EntityFromWikipediaService } from "#services/entityFromWikipedia.service.js";

const getSuccessMessage = (g: GroupEntity, baseUrl: string): string =>
  `Group <a href="${baseUrl}/groups/${g.id}">${g.name}</a>`;

export const groupCommand = (ctx: WorkerContext): TGBotProvider => {
  const handleGroupMessage = async (
    msg: TelegramBot.Message,
    match: RegExpExecArray | null,
  ): Promise<void> => {
    if (!match || match[1] === "") {
      return Promise.resolve();
    }

    ctx.logger.debug.log(`Match %O`, match);

    return pipe(
      EntityFromWikipediaService({
        search: match[1],
        type: GROUPS.literals[0],
        chatId: msg.chat.id,
        fromId: msg.from?.id,
        getIdentifier: getUsernameFromDisplayName,
        findOne: (search) =>
          ctx.db.findOne(GroupEntity, { where: { username: search } }),
        fetchAndSave: (title, wp) =>
          fetchAndCreateGroupFromWikipedia(title, wp)(ctx),
        getSuccessMessage: getSuccessMessage,
      })(ctx),
      throwTE,
    );
  };

  ctx.tg.api.onText(/\/group\s(.*)/, (msg, match) => {
    void handleGroupMessage(msg, match);
  });

  return ctx.tg;
};
