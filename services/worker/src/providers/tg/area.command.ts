import { AreaEntity } from "@liexp/backend/lib/entities/Area.entity.js";
import { type TGBotProvider } from "@liexp/backend/lib/providers/tg/tg.provider.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { AREAS } from "@liexp/shared/lib/io/http/Area.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import kebabCase from "lodash/kebabCase.js";
import { type WorkerContext } from "#context/context.js";
import { fetchAndCreateAreaFromWikipedia } from "#flows/area/fetchAndCreateAreaFromWikipedia.js";
import { EntityFromWikipediaService } from "#services/entityFromWikipedia.service.js";

const getSuccessMessage = (area: AreaEntity, baseUrl: string): string =>
  `Area <a href="${baseUrl}/areas/${area.id}">${area.label}</a>`;

export const areaCommand = (ctx: WorkerContext): TGBotProvider => {
  ctx.tg.api.onText(/\/area\s(.*)/, (msg, match) => {
    if (!match || match[1] === "") {
      return;
    }

    void pipe(
      EntityFromWikipediaService({
        type: AREAS.literals[0],
        search: match[1],
        chatId: msg.chat.id,
        fromId: msg.from?.id,
        getIdentifier: (search) => kebabCase(search),
        findOne: (label) => ctx.db.findOne(AreaEntity, { where: { label } }),
        getSuccessMessage: (area) => getSuccessMessage(area, ctx.env.WEB_URL),
        fetchAndSave: (search, wp) =>
          pipe(
            fetchAndCreateAreaFromWikipedia(search, wp)(ctx),
            fp.TE.map((area) => area.area),
          ),
      })(ctx),
      throwTE,
    ).catch((e) => {
      ctx.logger.error.log(`Failed to create area: %O`, e);
    });
  });

  return ctx.tg;
};
