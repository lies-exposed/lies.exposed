import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import D from "debug";
import { IsNull } from "typeorm";
import { startContext } from "../start-ctx.js";
import { AreaEntity } from "#entities/Area.entity.js";

const run = async (): Promise<void> => {
  //   const [, , url] = process.argv;

  const ctx = await startContext();

  D.enable(ctx.env.DEBUG);

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

void run();
