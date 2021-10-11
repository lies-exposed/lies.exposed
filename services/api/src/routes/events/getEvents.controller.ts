import { AddEndpoint, Endpoints } from "@econnessione/shared/endpoints";
import { Router } from "express";
import * as A from "fp-ts/lib/Array";
import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import * as R from "fp-ts/lib/Record";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { Brackets } from "typeorm";
import { toEventIO } from "./event.io";
import { EventEntity } from "@entities/Event.entity";
import { RouteContext } from "@routes/route.types";
import { getORMOptions } from "@utils/listQueryToORMOptions";

export const MakeListEventRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(Endpoints.Event.List, ({ query }) => {
    ctx.logger.info.log("Query %O", query);
    const {
      actors,
      groups,
      groupsMembers,
      links,
      startDate,
      endDate,
      ...queryRest
    } = query;
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

    ctx.logger.debug.log(`Find options conditions: %O`, {
      actors,
      groups,
      groupsMembers,
      ...findOptions,
    });

    const sqlTask = pipe(
      ctx.db.manager
        .createQueryBuilder(EventEntity, "event")
        .leftJoinAndSelect("event.actors", "actors")
        .leftJoinAndSelect("event.groups", "groups")
        .leftJoinAndSelect("event.groupsMembers", "groupsMembers")
        .leftJoinAndSelect("event.links", "links")
        .leftJoinAndSelect("event.images", "images")
        .loadAllRelationIds({ relations: ["keywords"] }),
      (q) => {
        return q.where(
          new Brackets((qb) => {
            return pipe(
              [
                { key: "groups.id IN (:...groups)", items: groups },
                { key: "actors.id IN (:...actors)", items: actors },
                {
                  key: "groupsMembers.id IN (:...groupsMembers)",
                  items: groupsMembers,
                },
                {
                  key: "links.id IN (:...links)",
                  items: links,
                },
              ],
              A.map((i) =>
                pipe(
                  i.items,
                  O.map((items) => ({ items, key: i.key }))
                )
              ),
              A.filter(O.isSome),
              A.map((v) => v.value),
              A.reduceWithIndex(qb, (index, acc, { key, items }) => {
                ctx.logger.debug.log("Current items %s %O", key, items);

                const varName = key.split(".")[0];
                if (index >= 1) {
                  return acc.orWhere(key, { [varName]: items });
                }
                return acc.where(key, {
                  [varName]: items,
                });
              })
            );
          })
        );
      },
      (q) => {
        if (O.isSome(startDate) && O.isSome(endDate)) {
          return q.andWhere(
            "event.startDate > :startDate AND (event.endDate < :endDate OR event.endDate IS NULL)",
            {
              startDate: startDate.value,
              endDate: endDate.value,
            }
          );
        }

        if (O.isSome(startDate) && O.isNone(endDate)) {
          return q.andWhere("event.startDate > :startDate", {
            startDate: startDate.value,
          });
        }

        if (O.isNone(startDate) && O.isSome(endDate)) {
          return q.andWhere("event.endDate > :endDate", {
            endDate: endDate.value,
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
              [`event.${k}`]: v,
            }))
          );
          return q.orderBy(order);
        }
        return q;
      },
      (q) => {
        const qq = q.skip(findOptions.skip).take(findOptions.take);

        // ctx.logger.info.log(`SQL query %O`, qq.getQueryAndParameters());

        return ctx.db.execQuery(() => qq.getManyAndCount());
      }
    );
    return pipe(
      sqlTask,
      TE.chain(([events, count]) =>
        pipe(
          events,
          A.map((e) =>
            toEventIO({
              ...e,
              actors: e.actors.map((a) => a.id) as any,
              groups: e.groups.map((g) => g.id) as any,
              groupsMembers: e.groupsMembers.map((g) => g.id) as any,
              links: e.links.map((l) => l.id) as any,
            })
          ),
          A.sequence(E.Applicative),
          E.map((data) => ({ data, total: count })),
          TE.fromEither
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
  });
};
