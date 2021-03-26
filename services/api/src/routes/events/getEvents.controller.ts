import * as endpoints from "@econnessione/shared/endpoints";
import { EventEntity } from "@entities/Event.entity";
import { getORMOptions } from "@utils/listQueryToORMOptions";
import { Router } from "express";
import { sequenceS } from "fp-ts/lib/Apply";
import * as A from "fp-ts/lib/Array";
import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import * as R from "fp-ts/lib/Record";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { RouteContext } from "routes/route.types";
import { AddEndpoint } from "ts-endpoint-express";
import { toEventIO } from "./event.io";

export const MakeListEventRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(endpoints.Event.List, ({ query: { actors, ...query } }) => {
    ctx.logger.info.log("Query %O", query);
    const findOptions = getORMOptions(
      {
        ...query,
        _sort: pipe(
          query._sort,
          O.alt(() => O.some("startDate"))
        ),
      },
      ctx.env.DEFAULT_PAGE_SIZE
    );

    const whereConditions = {
      ...findOptions.where,
    };

    ctx.logger.debug.log(`Where conditions: %O`, whereConditions);

    const sqlTask = pipe(
      ctx.db.manager
        .createQueryBuilder(EventEntity, "event")
        .addSelect("actors.id", "actors")
        .addSelect("groups.id", "groups")
        .addSelect("groupsMembers.id", "groupsMembers")
        .leftJoin("event.actors", "actors")
        .leftJoin("event.groups", "groups")
        .leftJoin("event.groupsMembers", "groupsMembers")
        .leftJoinAndSelect("event.images", "images"),
      (q) => {
        if (O.isSome(actors)) {
          return q.where("actors.id = :actorId", { actorId: actors.value });
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
              [`event.${k}`]: v,
            })
          );
          return q.orderBy(order);
        }
        return q;
      },
      (q) => {
        return ctx.db.execQuery(() =>
          q.skip(findOptions.skip).take(findOptions.take).getManyAndCount()
        );
      }
    );
    return pipe(
      sqlTask,
      TE.chain(([events, count]) =>
        sequenceS(TE.taskEither)({
          data: TE.fromEither(
            A.traverse(E.either)(toEventIO)(
              events.map((e) => ({ ...e, links: [] }))
            )
          ),
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
