import path from "path";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { sequenceS } from "fp-ts/lib/Apply.js";
import { LinkEntity } from "#entities/Link.entity.js";
import { type TEFlow } from "#flows/flow.types.js";

export const getLinksWithoutThumbnail: TEFlow<[], number> = (ctx) => () => {
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

export const getLinksWithoutPublishDate: TEFlow<[], number> = (ctx) => () => {
  return pipe(
    ctx.db.execQuery(() => {
      return ctx.db.manager
        .createQueryBuilder(LinkEntity, "link")
        .where("link.publishDate IS NULL")
        .getCount();
    }),
  );
};

export const getTotalLinks: TEFlow<[], number> = (ctx) => () => {
  return pipe(
    ctx.db.execQuery(() => {
      return ctx.db.manager.createQueryBuilder(LinkEntity, "link").getCount();
    }),
  );
};

export const getLinkAdminStatsFlow: TEFlow<
  [],
  {
    total: number;
    noPublishDate: number;
    noThumbnails: number;
  }
> = (ctx) => () => {
  const adminLinkStatsCachePath = path.resolve(
    ctx.config.dirs.temp.stats,
    `links/stats.json`,
  );

  return pipe(
    sequenceS(fp.TE.ApplicativePar)({
      total: getTotalLinks(ctx)(),
      noPublishDate: getLinksWithoutPublishDate(ctx)(),
      noThumbnails: getLinksWithoutThumbnail(ctx)(),
    }),
    ctx.fs.getOlderThanOr(adminLinkStatsCachePath, 6),
  );
};
