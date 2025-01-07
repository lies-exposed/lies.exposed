import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { sequenceS } from "fp-ts/lib/Apply.js";
import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import { Brackets } from "typeorm";
import { type DatabaseContext } from "../../../context/db.context.js";
import { MediaEntity } from "../../../entities/Media.entity.js";
import { type DBError } from "../../../providers/orm/database.provider.js";
import { DBService } from "../../../services/db.service.js";
import {
  type GetOrphanMediaFlowOutput,
  getOrphanMediaFlow,
} from "./getOrphanMedia.flow.js";
import { getTempMediaCountFlow } from "./getTempMediaCount.flow.js";
import { type ENVContext } from "context/env.context.js";
import { type FSClientContext } from "context/fs.context.js";
import { type LoggerContext } from "context/logger.context.js";
import { type SpaceContext } from "context/space.context.js";

const getTotalMedia =
  <C extends DatabaseContext>(): ReaderTaskEither<C, DBError, number> =>
  (ctx) => {
    return pipe(
      ctx.db.execQuery(() => {
        return ctx.db.manager
          .createQueryBuilder(MediaEntity, "media")
          .getCount();
      }),
    );
  };

export const getMediaWithoutThumbnailsFlow =
  <C extends DatabaseContext>(): ReaderTaskEither<C, DBError, MediaEntity[]> =>
  (ctx) => {
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

const getMediaInNeedToRegenerateThumbnailFlow = <
  C extends DatabaseContext,
>(): ReaderTaskEither<C, DBError, number> => {
  return pipe(
    DBService.execQuery((em) => {
      return (
        em
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

export const getMediaAdminStatsFlow = <
  C extends SpaceContext & { config: Record<string, any> } & DatabaseContext &
    FSClientContext &
    LoggerContext &
    ENVContext,
>(): ReaderTaskEither<
  C,
  DBError,
  {
    total: number;
    orphans: GetOrphanMediaFlowOutput;
    temp: any[];
    noThumbnails: MediaEntity[];
    needRegenerateThumbnail: number;
  }
> => {
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
