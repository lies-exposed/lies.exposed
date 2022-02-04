import { AddEndpoint, Endpoints } from "@econnessione/shared/endpoints";
import { Router } from "express";
import * as A from "fp-ts/lib/Array";
import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import * as R from "fp-ts/lib/Record";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { toImageIO } from "./media.io";
import { MediaEntity } from "@entities/Media.entity";
import { RouteContext } from "@routes/route.types";
import { getORMOptions } from "@utils/orm.utils";

export const MakeListMediaRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(
    Endpoints.Media.List,
    ({ query: { events, ids, description, ...query } }) => {
      const findOptions = getORMOptions(
        { ...query },
        ctx.env.DEFAULT_PAGE_SIZE
      );

      ctx.logger.debug.log(`Find Options %O`, { ...findOptions, events });

      const findTask = pipe(
        ctx.db.manager.createQueryBuilder(MediaEntity, "image"),
        (q) => {
          if (O.isSome(description)) {
            return q.where("lower(image.description) LIKE :description", {
              description: `%${description.value}%`,
            });
          }
          if (O.isSome(ids)) {
            return q.where("image.id IN (:...ids)", {
              ids: ids.value,
            });
          }
          if (O.isSome(events)) {
            return q.where("events.id IN (:...events)", {
              events: events.value,
            });
          }
          return q;
        },
        (q) => {
          if (findOptions.order !== undefined) {
            ctx.logger.debug.log("Order %O", findOptions.order);
            const order = pipe(
              findOptions.order,
              R.reduceWithIndex({}, (k, acc, v) => ({
                ...acc,
                [`image.${k}`]: v,
              }))
            );
            return q.orderBy(order);
          }
          return q;
        },
        (q) => {
          return q.skip(findOptions.skip).take(findOptions.take);
        },
        (q) => {
          return ctx.db.execQuery(() => q.getManyAndCount());
        }
      );

      return pipe(
        findTask,
        TE.chain(([data, total]) =>
          pipe(
            data,
            A.traverse(E.either)(toImageIO),
            TE.fromEither,
            TE.map((results) => ({
              total,
              data: results,
            }))
          )
        ),
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
