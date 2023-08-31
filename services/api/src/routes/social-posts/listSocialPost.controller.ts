import { fp } from "@liexp/core/lib/fp";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints";
import { type Router } from "express";
import { sequenceS } from "fp-ts/Apply";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { type RouteContext } from "../route.types";
import { SocialPostEntity } from "@entities/SocialPost.entity";
import { addOrder, getORMOptions } from "@utils/orm.utils";

export const MakeListSocialPostRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(
    Endpoints.SocialPosts.List,
    ({ query: { status, entity, distinct, ...query } }) => {
      const findSocialPostTask = ctx.db.manager
        .createQueryBuilder()
        .select()
        .from(SocialPostEntity, "sp");

      const ormOpts = getORMOptions(query, ctx.env.DEFAULT_PAGE_SIZE);
      if (fp.O.isSome(status)) {
        findSocialPostTask.where("status = :status", { status: status.value });
      }

      if (fp.O.isSome(entity)) {
        const where = fp.O.isSome(status)
          ? findSocialPostTask.andWhere.bind(findSocialPostTask)
          : findSocialPostTask.where.bind(findSocialPostTask);

        where("entity = :entity", { entity: entity.value });
      }

      const isDistinct = pipe(
        distinct,
        fp.O.filter((distinct) => distinct),
        fp.O.isSome,
      );

      if (isDistinct) {
        findSocialPostTask.distinctOn(["sp.entity"]);
        findSocialPostTask.groupBy("sp.entity");
        ormOpts.order = { "sp.entity": "DESC" };
      }

      if (ormOpts.order) {
        addOrder(ormOpts.order, findSocialPostTask);
      }

      findSocialPostTask
        .addSelect("*")
        .addSelect(
          (s) =>
            s
              .from(SocialPostEntity, "sub_sp")
              .addSelect("count(*)", 'publishCount')
              .where('"entity" = "sp"."entity"'),

          "publishCount",
        )
        .addGroupBy("sp.id")
        .skip(ormOpts.skip)
        .take(ormOpts.take);

      ctx.logger.debug.log(`Find social posts %s`, findSocialPostTask.getSql());

      return pipe(
        sequenceS(TE.ApplicativePar)({
          data: ctx.db.execQuery(() => findSocialPostTask.getRawAndEntities()),
          total: ctx.db.count(SocialPostEntity),
        }),
        // TE.chain(({ data, total }) =>
        //   pipe(
        //     data,
        //     A.map(toPageIO),
        //     A.sequence(E.Applicative),
        //     TE.fromEither,
        //     TE.map((data) => ({ total, data }))
        //   )
        // ),
        TE.map(({ data, total }) => ({
          body: {
            data: data.raw,
            total,
          },
          statusCode: 200,
        })),
      );
    },
  );
};
