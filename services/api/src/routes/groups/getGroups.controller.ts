import { AddEndpoint, Endpoints } from "@econnessione/shared/endpoints";
import { getORMOptions } from "@utils/listQueryToORMOptions";
import { Router } from "express";
import * as A from "fp-ts/lib/Array";
import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import * as R from "fp-ts/lib/Record";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { RouteContext } from "routes/route.types";
import { GroupEntity } from "../../entities/Group.entity";
import { toGroupIO } from "./group.io";

export const MakeListGroupRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(
    Endpoints.Group.List,
    ({ query: { ids, members, ...query } }) => {
      const findOptions = getORMOptions(
        { ...query, id: ids },
        ctx.env.DEFAULT_PAGE_SIZE
      );

      const findGroupsTask = pipe(
        ctx.db.manager
          .createQueryBuilder(GroupEntity, "group")
          .leftJoinAndSelect("group.members", "members")
          .leftJoinAndSelect("members.actor", "actor"),
        (q) => {
          if (O.isSome(members)) {
            ctx.logger.debug.log("Where members %O", members.value);
            return q.andWhere("members.actor IN (:...members)", {
              members: members.value,
            });
          }
          return q;
        },
        (q) => {
          if (findOptions.order) {
            const order = R.record.reduceWithIndex(
              findOptions.order,
              {},
              (k, acc, v) => ({
                ...acc,
                [`group.${k}`]: v,
              })
            );
            ctx.logger.debug.log("Ordering %O", order);
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
        pipe(
          findGroupsTask,
          TE.chain(([data, count]) =>
            pipe(
              data,
              A.traverse(E.Applicative)((g) =>
                toGroupIO({
                  ...g,
                  members: g.members.map((d) => d.id) as any,
                })
              ),
              TE.fromEither,
              TE.map((data) => ({ count, data }))
            )
          )
        ),
        TE.map(({ data, count }) => ({
          body: {
            data: data,
            total: count,
          },
          statusCode: 200,
        }))
      );
    }
  );
};
