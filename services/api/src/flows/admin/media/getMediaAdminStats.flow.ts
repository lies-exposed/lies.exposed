import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { sequenceS } from "fp-ts/lib/Apply.js";
import { Brackets } from "typeorm";
import { MediaEntity } from "#entities/Media.entity.js";
import { type TEReader } from "#flows/flow.types.js";
import {
  type GetOrphanMediaFlowOutput,
  getOrphanMediaFlow,
} from "#flows/media/getOrphanMedia.flow.js";
import { getTempMediaCountFlow } from "#flows/media/getTempMediaCount.flow.js";

export const getTotalMedia = (): TEReader<number> => (ctx) => {
  return pipe(
    ctx.db.execQuery(() => {
      return ctx.db.manager.createQueryBuilder(MediaEntity, "media").getCount();
    }),
  );
};

export const getMediaWithoutThumbnailsFlow =
  (): TEReader<MediaEntity[]> => (ctx) => {
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

export const getMediaInNeedToRegenerateThumbnailFlow =
  (): TEReader<number> => (ctx) => {
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

export const getMediaAdminStatsFlow = (): TEReader<{
  total: number;
  orphans: GetOrphanMediaFlowOutput;
  temp: any[];
  noThumbnails: MediaEntity[];
  needRegenerateThumbnail: number;
}> => {
  return pipe(
    sequenceS(fp.RTE.ApplicativePar)({
      total: getTotalMedia(),
      orphans: getOrphanMediaFlow(),
      temp: getTempMediaCountFlow(),
      noThumbnails: getMediaWithoutThumbnailsFlow(),
      needRegenerateThumbnail: getMediaInNeedToRegenerateThumbnailFlow(),
    }),
  );
};
