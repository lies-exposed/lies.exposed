import { AddEndpoint, Endpoints } from "@liexp/shared/endpoints";
import { type Router } from "express";
import * as A from "fp-ts/Array";
import * as E from "fp-ts/Either";
import * as IOE from "fp-ts/IOEither";
import * as O from "fp-ts/Option";
import * as R from "fp-ts/Record";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { type RouteContext } from "../route.types";
import { toAreaIO } from "./Area.io";
import { AreaEntity } from "@entities/Area.entity";
import { toControllerError } from "@io/ControllerError";
import { getORMOptions } from "@utils/orm.utils";

export const MakeListAreaRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(
    Endpoints.Area.List,
    ({ query: { q: search, ids, ...query } }) => {
      const findOptions = getORMOptions(
        { ...query },
        ctx.env.DEFAULT_PAGE_SIZE
      );

      const findT = pipe(
        IOE.tryCatch(() => {
          return pipe(
            ctx.db.manager
              .createQueryBuilder(AreaEntity, "area")
              .select()
              .leftJoinAndSelect("area.media", "media"),
            (q) => {
              if (O.isSome(search)) {
                return q.where("lower(unaccent(area.label)) LIKE lower(:search)", {
                  search: `%${search.value}%`,
                });
              }

              if (O.isSome(ids)) {
                return q.andWhere("area.id IN (:...ids)", {
                  ids: ids.value,
                });
              }
              return q;
            },
            (q) => {
              if (findOptions.order) {
                const order = pipe(
                  findOptions.order,
                  R.reduceWithIndex({}, (k, acc, v) => ({
                    ...acc,
                    [`area.${k}`]: v,
                  }))
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
        TE.chain((q) => ctx.db.execQuery(() => q.getManyAndCount()))
      );

      return pipe(
        findT,
        TE.chain(([areas, total]) => {
          return pipe(
            areas,
            A.traverse(E.Applicative)((a) =>
              toAreaIO({ ...a, media: a.media.map((m) => m.id) as any[] })
            ),
            TE.fromEither,
            TE.map((data) => ({ total, data }))
          );
        }),
        TE.map(({ data, total }) => ({
          body: {
            data,
            total,
          },
          statusCode: 200,
        }))
      );
    }
  );
};
