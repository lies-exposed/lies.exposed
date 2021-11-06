import { AddEndpoint, Endpoints } from "@econnessione/shared/endpoints";
import { Router } from "express";
import * as A from "fp-ts/lib/Array";
import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import * as R from "fp-ts/lib/Record";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { ActorEntity } from "../../entities/Actor.entity";
import { toActorIO } from "./actor.io";
import { getORMOptions } from "@utils/listQueryToORMOptions";
import { RouteContext } from "routes/route.types";

export const MakeListPageRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(
    Endpoints.Actor.List,
    ({ query: { ids, fullName, ...query } }) => {
      const findOptions = getORMOptions(
        { ...query },
        ctx.env.DEFAULT_PAGE_SIZE
      );

      ctx.logger.debug.log(`Find Options %O`, findOptions);

      const findTask = pipe(
        ctx.db.manager
          .createQueryBuilder(ActorEntity, "actors")
          .loadAllRelationIds({ relations: ["memberIn"] }),
        (q) => {
          if (O.isSome(ids)) {
            return q.andWhere("actors.id IN (:...ids)", {
              ids: ids.value,
            });
          }
          if (O.isSome(fullName)) {
            return q.andWhere("lower(actors.fullName) LIKE :fullName", {
              fullName: `%${fullName.value}%`,
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
                [`actors.${k}`]: v,
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
            A.traverse(E.either)(toActorIO),
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
