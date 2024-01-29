import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { sequenceS } from "fp-ts/lib/Apply.js";
import { MediaEntity } from "#entities/Media.entity.js";
import { type TEFlow } from "#flows/flow.types.js";
import { getOrphanMediaFlow } from "#flows/media/getOrphanMedia.flow.js";
import { getTempMediaCountFlow } from "#flows/media/getTempMediaCount.flow.js";

export const getMediaWithoutThumbnailsFlow: TEFlow<[], MediaEntity[]> =
  (ctx) => () => {
    return pipe(
      ctx.db.execQuery(() => {
        return ctx.db.manager
          .createQueryBuilder(MediaEntity, "media")
          .where("media.thumbnail IS NULL")
          .andWhere("media.extra -> 'thumbnails' ->> 'error' IS NULL")
          .take(10)
          .printSql()
          .getMany();
      }),
    );
  };

export const getMediaAdminStatsFlow: TEFlow<[], any> = (ctx) => () => {
  return pipe(
    sequenceS(fp.TE.ApplicativePar)({
      orphans: getOrphanMediaFlow(ctx)(),
      temp: getTempMediaCountFlow(ctx)(),
      noThumbnails: getMediaWithoutThumbnailsFlow(ctx)(),
    }),
  );
};
