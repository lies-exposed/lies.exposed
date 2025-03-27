import { GroupEntity } from "@liexp/backend/lib/entities/Group.entity.js";
import { type TGBotProvider } from "@liexp/backend/lib/providers/tg/tg.provider.js";
import { GroupRepository } from "@liexp/backend/lib/services/entity-repository.service.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { getUsernameFromDisplayName } from "@liexp/shared/lib/helpers/actor.js";
import { UUID } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { GROUPS } from "@liexp/shared/lib/io/http/Group.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import { Schema } from "effect";
import type TelegramBot from "node-telegram-bot-api";
import { type WorkerContext } from "#context/context.js";
import { fetchGroupFromWikipedia } from "#flows/group/fetchGroupFromWikipedia.js";
import { toWorkerError } from "#io/worker.error.js";
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
        type: GROUPS.Type,
        chatId: msg.chat.id,
        fromId: msg.from?.id,
        getIdentifier: getUsernameFromDisplayName,
        findOne: (search) =>
          ctx.db.findOne(GroupEntity, { where: { username: search } }),
        fetchAndSave: (title, wp) =>
          pipe(
            fetchGroupFromWikipedia(title, wp)(ctx),
            fp.TE.chain((g) =>
              pipe(
                GroupRepository.save([
                  {
                    ...g,
                    avatar: Schema.is(UUID)(g.avatar)
                      ? {
                          id: g.avatar,
                        }
                      : {
                          ...g.avatar,
                          events: [],
                          links: [],
                          keywords: [],
                          areas: [],
                        },
                    members: [],
                  },
                ])(ctx),
                fp.TE.mapLeft(toWorkerError),
              ),
            ),

            fp.TE.map((g) => g[0]),
          ),
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
