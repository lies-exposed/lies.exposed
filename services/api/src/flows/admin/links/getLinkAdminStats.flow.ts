import path from "path";
import { getOlderThanOr } from "@liexp/backend/lib/flows/fs/getOlderThanOr.flow.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { sequenceS } from "fp-ts/lib/Apply.js";
import { LinkEntity } from "#entities/Link.entity.js";
import { type TEReader } from "#flows/flow.types.js";
import { type RouteContext } from "#routes/route.types.js";

const getLinksWithoutThumbnail = (): TEReader<number> => (ctx) => {
  return pipe(
    ctx.db.execQuery(() => {
      return ctx.db.manager
        .createQueryBuilder(LinkEntity, "link")
        .leftJoinAndSelect("link.image", "image")
        .where("image.thumbnail IS NULL")
        .printSql()
        .getCount();
    }),
  );
};

const getLinksWithoutPublishDate = (): TEReader<number> => (ctx) => {
  return pipe(
    ctx.db.execQuery(() => {
      return ctx.db.manager
        .createQueryBuilder(LinkEntity, "link")
        .where("link.publishDate IS NULL")
        .getCount();
    }),
  );
};

const getTotalLinks = (): TEReader<number> => (ctx) => {
  return pipe(
    ctx.db.execQuery(() => {
      return ctx.db.manager.createQueryBuilder(LinkEntity, "link").getCount();
    }),
  );
};

export const getLinkAdminStatsFlow = (): TEReader<{
  total: number;
  noPublishDate: number;
  noThumbnails: number;
}> => {
  return pipe(
    fp.RTE.ask<RouteContext>(),
    fp.RTE.map((ctx) =>
      path.resolve(ctx.config.dirs.temp.stats, `links/stats.json`),
    ),
    fp.RTE.chain((adminLinkStatsCachePath) =>
      getOlderThanOr(
        adminLinkStatsCachePath,
        6,
      )(
        sequenceS(fp.RTE.ApplicativePar)({
          total: getTotalLinks(),
          noPublishDate: getLinksWithoutPublishDate(),
          noThumbnails: getLinksWithoutThumbnail(),
        }),
      ),
    ),
  );
};
