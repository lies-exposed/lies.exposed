import { Endpoints, AddEndpoint } from "@econnessione/shared/endpoints";
import { Router } from "express";
import { sequenceS } from "fp-ts/lib/Apply";
import * as A from "fp-ts/lib/Array";
import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import * as R from "fp-ts/lib/Record";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { toEventIO } from "./event.io";
import { EventEntity } from "@entities/Event.entity";
import { getORMOptions } from "@utils/listQueryToORMOptions";
import { RouteContext } from "routes/route.types";

export const MakeListEventRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(Endpoints.Event.List, ({ query }) => {
    ctx.logger.info.log("Query %O", query);
    const { actors, groups, groupsMembers, ...queryRest } = query;
    const findOptions = getORMOptions(
      {
        ...queryRest,
        _sort: pipe(
          queryRest._sort,
          O.alt(() => O.some("startDate"))
        ),
      },
      ctx.env.DEFAULT_PAGE_SIZE
    );

    ctx.logger.debug.log(`Find options conditions: %O`, findOptions);

    const sqlTask = pipe(
      ctx.db.manager
        .createQueryBuilder(EventEntity, "event")
        .leftJoinAndSelect("event.actors", "actors")
        .leftJoinAndSelect("event.groups", "groups")
        .leftJoinAndSelect("event.groupsMembers", "groupsMembers")
        .leftJoinAndSelect("event.images", "images")
        .loadAllRelationIds({
          relations: ["groups", "actors", "groupsMembers"],
        }),
      (q) => {
        if (O.isSome(actors)) {
          return q.andWhere("actors.id IN (:...actors)", {
            actors: actors.value,
          });
        }
        if (O.isSome(groups)) {
          return q.andWhere("groups.id IN (:...groups)", {
            groups: groups.value,
          });
        }

        if (O.isSome(groupsMembers)) {
          return q.andWhere("groupsMembers.id IN (:...groupsMembers)", {
            groupsMembers: groupsMembers.value,
          });
        }
        return q;
      },
      (q) => {
        if (findOptions.order) {
          const order = R.reduceWithIndex({}, (k, acc, v) => ({
            ...acc,
            [`event.${k}`]: v,
          }))(findOptions.order);
          return q.orderBy(order);
        }
        return q;
      },
      (q) => {
        const qq = q.skip(findOptions.skip).take(findOptions.take);

        // ctx.logger.debug.log(`SQL query %s`, qq.getSql());

        return ctx.db.execQuery(() => qq.getManyAndCount());
      }
    );
    return pipe(
      sqlTask,
      TE.chain(([events, count]) =>
        sequenceS(TE.taskEither)({
          data: TE.fromEither(A.traverse(E.either)(toEventIO)(events)),
          total: TE.right(count),
        })
      ),
      TE.map(({ data, total }) => ({
        body: {
          data,
          total,
        },
        statusCode: 200,
      }))
    );
  });
};
