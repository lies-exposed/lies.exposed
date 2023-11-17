import { fp } from "@liexp/core/lib/fp";
import { type ListAreaQuery } from "@liexp/shared/lib/io/http/Area";
import * as IOE from "fp-ts/IOEither";
import * as O from "fp-ts/Option";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { AreaEntity } from "@entities/Area.entity";
import { type TEFlow } from "@flows/flow.types";
import { toControllerError } from "@io/ControllerError";
import {
  aggregateSocialPostsPerEntry,
  leftJoinSocialPosts,
} from "@queries/socialPosts/leftJoinSocialPosts.query";
import { getORMOptions } from "@utils/orm.utils";

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
            .leftJoinAndSelect("area.media", "media"),
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
          return await q.getManyAndCount();
        }),
      ),
    );
  };
