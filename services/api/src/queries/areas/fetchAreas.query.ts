import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type ListAreaQuery } from "@liexp/shared/lib/io/http/Area.js";
import * as IOE from "fp-ts/IOEither";
import * as O from "fp-ts/Option";
import * as TE from "fp-ts/TaskEither";
import { AreaEntity } from "#entities/Area.entity.js";
import { type TEFlow } from "#flows/flow.types.js";
import { toControllerError } from "#io/ControllerError.js";
import {
  aggregateSocialPostsPerEntry,
  leftJoinSocialPosts,
} from "#queries/socialPosts/leftJoinSocialPosts.query.js";
import { getORMOptions } from "#utils/orm.utils.js";

export const fetchAreas: TEFlow<
  [ListAreaQuery, boolean],
  [AreaEntity[], number]
> =
  (ctx) =>
  ({ q: search, ids, draft, ...query }, isAdmin) => {
    const findOptions = getORMOptions({ ...query }, ctx.env.DEFAULT_PAGE_SIZE);

    return pipe(
      IOE.tryCatch(() => {
        return pipe(
          ctx.db.manager
            .createQueryBuilder(AreaEntity, "area")
            .select()
            .leftJoinAndSelect("area.featuredImage", "featuredImage"),
          // .leftJoinAndSelect("area.media", "media"),
          (q) => {
            if (isAdmin) {
              q.leftJoinAndSelect(
                leftJoinSocialPosts("areas"),
                "socialPosts",
                'area.id = "socialPosts"."socialPosts_entity"',
              );
            }
            return q;
          },
          (q) => {
            if (O.isSome(search)) {
              return q.where(
                "lower(unaccent(area.label)) LIKE lower(:search)",
                {
                  search: `%${search.value}%`,
                },
              );
            }

            if (O.isSome(ids)) {
              return q.andWhere("area.id IN (:...ids)", {
                ids: ids.value,
              });
            }
            if (isAdmin && O.isSome(draft)) {
              q.andWhere("draft = :draft", { draft: draft.value });
            } else {
              q.andWhere("draft = :draft", { draft: false });
            }
            return q;
          },
          (q) => {
            if (findOptions.order) {
              const order = pipe(
                findOptions.order,
                fp.R.reduceWithIndex(fp.S.Ord)({}, (k, acc, v) => ({
                  ...acc,
                  [`area.${k}`]: v,
                })),
              );
              return q.orderBy(order);
            }
            return q;
          },
          (q) => {
            return q.skip(findOptions.skip).take(findOptions.take);
          },
          // (q) => {
          //   ctx.logger.debug.log(
          //     `list area query: %O`,
          //     q.getQueryAndParameters()
          //   );
          //   return q;
          // }
        );
      }, toControllerError),
      TE.fromIOEither,
      TE.chain((q) =>
        ctx.db.execQuery(async (): Promise<[AreaEntity[], number]> => {
          if (isAdmin) {
            const results = await q.getRawAndEntities();
            const count = await q.getCount();
            const entities = results.entities.map((e) => ({
              ...e,
              socialPosts: aggregateSocialPostsPerEntry(
                "area_id",
                results.raw,
                e,
              ) as any[],
            }));
            return [entities, count];
          }
          return q.getManyAndCount();
        }),
      ),
    );
  };
