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
    const { actors, groups, groupsMembers, links, ...queryRest } = query;
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
      ctx.db.manager.createQueryBuilder(EventEntity, "event").select(),
      (q) => {
        if (O.isSome(actors)) {
          return q.innerJoinAndSelect(
            "event.actors",
            "actors",
            "actors.id IN (:...actors)",
            {
              actors: actors.value,
            }
          );
        }
        return q.leftJoinAndSelect("event.actors", "actors");
      },
      (q) => {
        if (O.isSome(groups)) {
          return q.innerJoinAndSelect(
            "event.groups",
            "groups",
            "groups.id IN (:...groups)",
            {
              groups: groups.value,
            }
          );
        }
        return q.leftJoinAndSelect("event.groups", "groups");
      },
      (q) => {
        if (O.isSome(groupsMembers)) {
          return q.innerJoinAndSelect(
            "event.groupsMembers",
            "groupsMembers",
            "groupsMembers.id IN (:...groupsMembers)",
            {
              groupsMembers: groupsMembers.value,
            }
          );
        }
        return q.leftJoinAndSelect("event.groupsMembers", "groupsMembers");
      },
      (q) => {
        if (O.isSome(links)) {
          return q.innerJoinAndSelect(
            "event.links",
            "links",
            "links.id IN (:...links)",
            {
              links: links.value,
            }
          );
        }
        return q.leftJoinAndSelect("event.links", "links");
      },
      (q) =>
        q.leftJoinAndSelect("event.images", "images").loadAllRelationIds({
          relations: ["groups", "actors", "groupsMembers", "links"],
        }),
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

        // ctx.logger.debug.log(`SQL query %s`, qq.getSql());

        return ctx.db.execQuery(() => qq.getManyAndCount());
      }
    );
    return pipe(
      sqlTask,
      TE.chain(([events, count]) =>
        sequenceS(TE.ApplicativeSeq)({
          data: TE.fromEither(A.traverse(E.Applicative)(toEventIO)(events)),
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
