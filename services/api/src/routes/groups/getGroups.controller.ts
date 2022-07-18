import { AddEndpoint, Endpoints } from "@liexp/shared/endpoints";
import { Router } from "express";
import * as A from "fp-ts/lib/Array";
import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { GroupEntity } from "../../entities/Group.entity";
import { RouteContext } from "../route.types";
import { toGroupIO } from "./group.io";
import { addOrder, getORMOptions } from "@utils/orm.utils";

export const MakeListGroupRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(
    Endpoints.Group.List,
    ({ query: { ids, members, name, ...query } }) => {
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
          if (O.isSome(name)) {
            ctx.logger.debug.log("Where name is %s", name.value);
            return q.andWhere("lower(group.name) LIKE :name", {
              name: `%${name.value}%`,
            });
          }

          if (O.isSome(ids)) {
            ctx.logger.debug.log("Where ids %O", ids.value);
            return q.andWhere("group.id IN (:...ids)", {
              ids: ids.value,
            });
          }
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
            return addOrder(findOptions.order, q, "group");
          }
          return q;
        },
        (q) => {
          const qq = q.skip(findOptions.skip).take(findOptions.take);

          ctx.logger.debug.log(`SQL query %O`, qq.getQueryAndParameters());

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
            data,
            total: count,
          },
          statusCode: 200,
        }))
      );
    }
  );
};
