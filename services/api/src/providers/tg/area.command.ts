import { type TGBotProvider } from "@liexp/backend/lib/providers/tg/tg.provider.js";
import { flow, fp, pipe } from "@liexp/core/lib/fp/index.js";
import { AREAS, type Area } from "@liexp/shared/lib/io/http/Area.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import kebabCase from "lodash/kebabCase.js";
import { type ServerContext } from "#context/context.type.js";
import { AreaEntity } from "#entities/Area.entity.js";
import { fetchAndCreateAreaFromWikipedia } from "#flows/areas/fetchAndCreateAreaFromWikipedia.js";
import { AreaIO } from "#routes/areas/Area.io.js";
import { EntityFromWikipediaService } from "#services/entityFromWikipedia.service.js";

const getSuccessMessage = (area: Area, baseUrl: string): string =>
  `Area <a href="${baseUrl}/areas/${area.id}">${area.label}</a>`;

export const areaCommand = (ctx: ServerContext): TGBotProvider => {
  ctx.tg.api.onText(/\/area\s(.*)/, (msg, match) => {
    if (!match || match[1] === "") {
      return;
    }

    void pipe(
      EntityFromWikipediaService({
        type: AREAS.value,
        search: match[1],
        chatId: msg.chat.id,
        fromId: msg.from?.id,
        getIdentifier: (search) => kebabCase(search),
        findOne: (label) =>
          pipe(
            ctx.db.findOne(AreaEntity, { where: { label } }),
            fp.TE.map(
              flow(
                fp.O.chain((a) =>
                  pipe(
                    AreaIO.decodeSingle(a, ctx.env.SPACE_ENDPOINT),
                    fp.E.fold(() => fp.O.none, fp.O.some),
                  ),
                ),
              ),
            ),
          ),
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
