import { ActorEntity } from "@liexp/backend/lib/entities/Actor.entity.js";
import { type TGBotProvider } from "@liexp/backend/lib/providers/tg/tg.provider.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { ACTORS } from "@liexp/io/lib/http/Actor.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import kebabCase from "lodash/kebabCase.js";
import { type Message } from "node-telegram-bot-api";
import { type WorkerContext } from "#context/context.js";
import { fetchAndCreateActorFromWikipedia } from "#flows/actor/fetchAndCreateActorFromWikipedia.flow.js";
import { toWorkerError } from "#io/worker.error.js";
import { EntityFromWikipediaService } from "#services/entityFromWikipedia.service.js";

const getSuccessMessage = (actor: ActorEntity, baseUrl: string): string =>
  `Actor <a href="${baseUrl}/actors/${actor.id}">${actor.fullName}</a>`;

export const actorCommand = (ctx: WorkerContext): TGBotProvider => {
  ctx.tg.onText(/\/actor\s(.*)/, (msg: Message, match) => {
    if (!match || match[1] === "") {
      return;
    }

    ctx.logger.debug.log(`Match %O`, match);
    const userId = msg.from?.id;

    const username = kebabCase(match[1]);
    ctx.logger.debug.log("Looking for actor %s (%s)", match[1], username);

    void pipe(
      EntityFromWikipediaService({
        type: ACTORS.literals[0],
        search: match[1],
        chatId: msg.chat.id,
        fromId: userId,
        getIdentifier: (s) => kebabCase(s),
        findOne: (u) =>
          pipe(
            ctx.db.findOne(ActorEntity, { where: { username: u } }),
            fp.TE.mapLeft((e) => toWorkerError(e)),
          ),
        getSuccessMessage: (actor: ActorEntity) =>
          getSuccessMessage(actor, ctx.env.WEB_URL),
        fetchAndSave: (label, wp) =>
          fetchAndCreateActorFromWikipedia(label, wp),
      })(ctx),
      throwTE,
    );
  });

  return ctx.tg;
};
