import { AreaEntity } from "@liexp/backend/lib/entities/Area.entity.js";
import { type TGBotProvider } from "@liexp/backend/lib/providers/tg/tg.provider.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { AREAS } from "@liexp/io/lib/http/Area.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import kebabCase from "lodash/kebabCase.js";
import { type Message } from "node-telegram-bot-api";
import { type WorkerContext } from "#context/context.js";
import { toWorkerError, type WorkerError } from "#io/worker.error.js";
import { fetchAndCreateAreaFromWikipedia } from "#flows/area/fetchAndCreateAreaFromWikipedia.js";
import { EntityFromWikipediaService } from "#services/entityFromWikipedia.service.js";

const getSuccessMessage = (area: AreaEntity, baseUrl: string): string =>
  `Area <a href="${baseUrl}/areas/${area.id}">${area.label}</a>`;

export const areaCommand = (ctx: WorkerContext): TGBotProvider => {
  ctx.tg.onText(/\/area\s(.*)/, (msg: Message, match) => {
    if (!match || match[1] === "") {
      return;
    }

    void pipe(
      EntityFromWikipediaService({
        type: AREAS.literals[0],
        search: match[1],
        chatId: msg.chat.id,
        fromId: msg.from?.id,
        getIdentifier: (s) => kebabCase(s),
        findOne: (label) =>
          pipe(
            ctx.db.findOne(AreaEntity, { where: { label } }),
            fp.TE.mapLeft((e) => toWorkerError(e) as WorkerError),
          ),
        getSuccessMessage: (area: AreaEntity) => getSuccessMessage(area, ctx.env.WEB_URL),
        fetchAndSave: (search, wp) => (c) =>
          pipe(
            fetchAndCreateAreaFromWikipedia(search, wp)(c),
            fp.TE.map((result: { area: AreaEntity; media: unknown[] }) => result.area),
          ),
      })(ctx),
      throwTE,
    ).catch((e) => {
      ctx.logger.error.log(`Failed to create area: %O`, e);
    });
  });

  return ctx.tg;
};
