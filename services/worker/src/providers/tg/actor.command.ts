import { ActorEntity } from "@liexp/backend/lib/entities/Actor.entity.js";
import { type TGBotProvider } from "@liexp/backend/lib/providers/tg/tg.provider.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { ACTORS } from "@liexp/shared/lib/io/http/Actor.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import kebabCase from "lodash/kebabCase.js";
import { type WorkerContext } from "#context/context.js";
import { fetchAndCreateActorFromWikipedia } from "#flows/actor/fetchAndCreateActorFromWikipedia.flow.js";
import { EntityFromWikipediaService } from "#services/entityFromWikipedia.service.js";

const getSuccessMessage = (actor: ActorEntity, baseUrl: string): string =>
  `Actor <a href="${baseUrl}/actors/${actor.id}">${actor.fullName}</a>`;

export const actorCommand = (ctx: WorkerContext): TGBotProvider => {
  ctx.tg.api.onText(/\/actor\s(.*)/, (msg, match) => {
    if (!match || match[1] === "") {
      return;
    }

    ctx.logger.debug.log(`Match %O`, match);
    const userId = msg.from?.id;
    const commandContext: {
      options: { title: string; pageid: number }[];
      search: string;
    } = {
      search: match[1],
      options: [],
    };

    const username = kebabCase(commandContext.search);
    ctx.logger.debug.log(
      "Looking for actor %s (%s)",
      commandContext.search,
      username,
    );

    void pipe(
      EntityFromWikipediaService({
        type: ACTORS.Type,
        search: commandContext.search,
        chatId: msg.chat.id,
        fromId: userId,
        getIdentifier: (search) => kebabCase(search),
        findOne: (username) =>
          ctx.db.findOne(ActorEntity, { where: { username } }),
        getSuccessMessage: (actor) => getSuccessMessage(actor, ctx.env.WEB_URL),
        fetchAndSave: (label, wp) =>
          fetchAndCreateActorFromWikipedia(label, wp)(ctx),
      })(ctx),
      throwTE,
    );
  });

  return ctx.tg;
};
