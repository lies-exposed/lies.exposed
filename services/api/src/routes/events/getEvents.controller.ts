import { AddEndpoint, Endpoints } from "@econnessione/shared/endpoints";
import { Router } from "express";
import * as A from "fp-ts/lib/Array";
import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import * as R from "fp-ts/lib/Record";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { Brackets, In } from "typeorm";
import { toEventIO } from "./event.io";
import { EventEntity } from "@entities/Event.entity";
import { GroupMemberEntity } from "@entities/GroupMember.entity";
import { ControllerError } from "@io/ControllerError";
import { RouteContext } from "@routes/route.types";
import { getORMOptions } from "@utils/listQueryToORMOptions";

export const MakeListEventRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(Endpoints.Event.List, ({ query }) => {
    ctx.logger.debug.log("Query %O", query);
    const {
      actors,
      groups,
      groupsMembers,
      links,
      keywords,
      media,
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

    const sqlTask = (
      input: typeof query
    ): TE.TaskEither<ControllerError, [EventEntity[], number]> =>
      pipe(
        ctx.db.manager
          .createQueryBuilder(EventEntity, "event")
          .leftJoinAndSelect("event.actors", "actors")
          .leftJoinAndSelect("event.groups", "groups")
          .leftJoinAndSelect("event.groupsMembers", "groupsMembers")
          .leftJoinAndSelect("event.links", "links")
          .leftJoinAndSelect("event.keywords", "keywords")
          .leftJoinAndSelect("event.media", "media"),
        (q) => {
          return q.where(
            new Brackets((qb) => {
              return pipe(
                [
                  { key: "groups.id IN (:...groups)", items: input.groups },
                  { key: "actors.id IN (:...actors)", items: input.actors },
                  {
                    key: "groupsMembers.id IN (:...groupsMembers)",
                    items: input.groupsMembers,
                  },
                  {
                    key: "links.id IN (:...links)",
                    items: input.links,
                  },
                  {
                    key: "keywords.id IN (:...keywords)",
                    items: input.keywords,
                  },
                  { key: "media.id IN (:...media)", items: input.media },
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
          if (O.isSome(query.title)) {
            return q.andWhere("lower(event.title) LIKE :title", {
              title: `%${query.title.value}%`,
            });
          }
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
      ctx.db.find(GroupMemberEntity, {
        where: {
          "actor.id": In(
            pipe(
              actors,
              O.getOrElse((): string[] => [])
            )
          ),
        },
        relations: ["actor"],
      }),
      TE.chain((gm) =>
        sqlTask({
          ...queryRest,
          actors,
          groups,
          links,
          media,
          keywords,
          startDate,
          endDate,
          groupsMembers: pipe(
            query.groupsMembers,
            O.map((groupsMembers) => groupsMembers.concat(gm.map((g) => g.id)))
          ),
        })
      ),
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
              keywords: e.keywords.map((k) => k.id) as any,
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
