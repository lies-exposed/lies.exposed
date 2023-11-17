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
    ({ query: { status, entity, distinct, type, ...query } }) => {
      const findSocialPostQuery = ctx.db.manager
        .createQueryBuilder()
        .select()
        .from(SocialPostEntity, "sp");

      const ormOpts = getORMOptions(query, ctx.env.DEFAULT_PAGE_SIZE);

      findSocialPostQuery.where('"type" = :type', {
        type,
      });
      if (fp.O.isSome(status)) {
        findSocialPostQuery.andWhere("status = :status", {
          status: status.value,
        });
      }

      if (fp.O.isSome(entity)) {
        findSocialPostQuery.andWhere("entity = :entity", {
          entity: entity.value,
        });
      }

      const isDistinct = pipe(
        distinct,
        fp.O.filter((distinct) => distinct),
        fp.O.isSome,
      );

      if (isDistinct) {
        findSocialPostQuery.distinctOn(["sp.entity"]);
        findSocialPostQuery.groupBy("sp.entity");
        ormOpts.order = {
          entity: "DESC",
          ...(ormOpts.order ?? {}),
        };
      }

      if (ormOpts.order) {
        addOrder(
          ormOpts.order,
          findSocialPostQuery,
          "sp",
          isDistinct ? ["sp.entity"] : [],
        );
      }

      findSocialPostQuery
        .addSelect("*")
        .addSelect(
          (s) =>
            s
              .from(SocialPostEntity, "sub_sp")
              .addSelect("count(*)", "publishCount")
              .where('"entity" = "sp"."entity"')
              .andWhere('"type" = :type', {
                type,
              }),

          "publishCount",
        )
        .addGroupBy("sp.id")
        .skip(ormOpts.skip)
        .take(ormOpts.take);

      ctx.logger.debug.log(
        `Find social posts %s`,
        findSocialPostQuery.getSql(),
      );

      return pipe(
        sequenceS(TE.ApplicativePar)({
          data: ctx.db.execQuery(() => findSocialPostQuery.getRawAndEntities()),
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
