import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import { IsNull } from "typeorm";
import { type CommandFlow } from "./command.type.js";
import { AreaEntity } from "#entities/Area.entity.js";

export const assignDefaultAreaFeaturedImage: CommandFlow = async (ctx) => {
  await pipe(
    ctx.db.find(AreaEntity, {
      where: {
        featuredImage: IsNull(),
      },
      relations: {
        featuredImage: true,
        media: true,
      },
    }),

    fp.TE.map((areas) =>
      pipe(
        areas,
        fp.A.map((area) => {
          area.featuredImage = area.featuredImage ?? area.media?.[0] ?? null;

          return area;
        }),
      ),
    ),
    fp.TE.chain((areas) => {
      return ctx.db.save(AreaEntity, areas);
    }),
    throwTE,
  )
    // eslint-disable-next-line no-console
    .then(console.log)
    // eslint-disable-next-line no-console
    .catch(console.error)
    .finally(() => process.exit(0));
};
