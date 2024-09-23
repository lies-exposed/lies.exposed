import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { sequenceS } from "fp-ts/lib/Apply.js";
import { Brackets } from "typeorm";
import { MediaEntity } from "#entities/Media.entity.js";
import { type TEFlow } from "#flows/flow.types.js";
import {
  type GetOrphanMediaFlowOutput,
  getOrphanMediaFlow,
} from "#flows/media/getOrphanMedia.flow.js";
import { getTempMediaCountFlow } from "#flows/media/getTempMediaCount.flow.js";

export const getTotalMedia: TEFlow<[], number> = (ctx) => () => {
  return pipe(
    ctx.db.execQuery(() => {
      return ctx.db.manager.createQueryBuilder(MediaEntity, "media").getCount();
    }),
  );
};

export const getMediaWithoutThumbnailsFlow: TEFlow<[], MediaEntity[]> =
  (ctx) => () => {
    return pipe(
      ctx.db.execQuery(() => {
        return (
          ctx.db.manager
            .createQueryBuilder(MediaEntity, "media")
            .where("media.thumbnail IS NULL")
            .andWhere("media.extra -> 'thumbnails' ->> 'error' IS NULL")
            // .printSql()
            .getMany()
        );
      }),
    );
  };

export const getMediaInNeedToRegenerateThumbnailFlow: TEFlow<[], number> =
  (ctx) => () => {
    return pipe(
      ctx.db.execQuery(() => {
        return (
          ctx.db.manager
            .createQueryBuilder(MediaEntity, "media")
            .where(
              new Brackets((qb) => {
                return qb
                  .where(
                    `("media"."extra" ->> 'needRegenerateThumbnail')::boolean = 'true'`,
                  )
                  .orWhere("media.extra -> 'needRegenerateThumbnail' is null ");
              }),
            )
            // .printSql()
            .getCount()
        );
      }),
    );
  };

export const getMediaAdminStatsFlow: TEFlow<
  [],
  {
    total: number;
    orphans: GetOrphanMediaFlowOutput;
    temp: any[];
    noThumbnails: MediaEntity[];
    needRegenerateThumbnail: number;
  }
> = (ctx) => () => {
  return pipe(
    sequenceS(fp.TE.ApplicativePar)({
      total: getTotalMedia(ctx)(),
      orphans: getOrphanMediaFlow(ctx)(),
      temp: getTempMediaCountFlow(ctx)(),
      noThumbnails: getMediaWithoutThumbnailsFlow(ctx)(),
      needRegenerateThumbnail: getMediaInNeedToRegenerateThumbnailFlow(ctx)(),
    }),
  );
};
