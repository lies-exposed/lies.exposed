import { type TGBotProvider } from "@liexp/backend/lib/providers/tg/tg.provider.js";
import { flow, fp, pipe } from "@liexp/core/lib/fp/index.js";
import { getUsernameFromDisplayName } from "@liexp/shared/lib/helpers/actor.js";
import { GROUPS } from "@liexp/shared/lib/io/http/Group.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import type TelegramBot from "node-telegram-bot-api";
import { GroupEntity } from "#entities/Group.entity.js";
import { fetchGroupFromWikipedia } from "#flows/groups/fetchGroupFromWikipedia.js";
import { type RouteContext } from "#routes/route.types.js";
import { EntityFromWikipediaService } from "#services/entityFromWikipedia.service.js";

const getSuccessMessage = (g: GroupEntity, baseUrl: string): string =>
  `Group <a href="${baseUrl}/groups/${g.id}">${g.name}</a>`;

export const groupCommand = (ctx: RouteContext): TGBotProvider => {
  const handleGroupMessage = async (
    msg: TelegramBot.Message,
    match: RegExpExecArray | null,
  ): Promise<void> => {
    if (!match || match[1] === "") {
      return Promise.resolve();
    }

    ctx.logger.debug.log(`Match %O`, match);

    return pipe(
      EntityFromWikipediaService(ctx)({
        search: match[1],
        type: GROUPS.value,
        chatId: msg.chat.id,
        fromId: msg.from?.id,
        getIdentifier: getUsernameFromDisplayName,
        findOne: (search) =>
          ctx.db.findOne(GroupEntity, { where: { username: search } }),
        fetchAndSave: flow(
          fetchGroupFromWikipedia(ctx),
          fp.TE.chain((g) => ctx.db.save(GroupEntity, [{ ...g, members: [] }])),
          fp.TE.map((g) => g[0]),
        ),
        getSuccessMessage: getSuccessMessage,
      }),
      throwTE,
    );
  };

  ctx.tg.api.onText(/\/group\s(.*)/, (msg, match) => {
    void handleGroupMessage(msg, match);
  });

  return ctx.tg;
};
