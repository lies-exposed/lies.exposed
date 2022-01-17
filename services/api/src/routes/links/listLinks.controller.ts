import { AddEndpoint, Endpoints } from "@econnessione/shared/endpoints";
import { Router } from "express";
import * as A from "fp-ts/lib/Array";
import * as E from "fp-ts/lib/Either";
import * as R from "fp-ts/lib/Record";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { RouteContext } from "../route.types";
import { toLinkIO } from "./link.io";
import { LinkEntity } from "@entities/Link.entity";
import { getORMOptions } from "@utils/listQueryToORMOptions";

export const MakeListLinksRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(
    Endpoints.Link.List,
    ({ query: { events, ids, title, ...query } }) => {
      const findOptions = getORMOptions(
        { ...query },
        ctx.env.DEFAULT_PAGE_SIZE
      );

      ctx.logger.debug.log(`find Options %O`, {
        events,
        ids,
        title,
        ...findOptions,
      });

      const listGroupsMembersTE = pipe(
        ctx.db.manager
          .createQueryBuilder(LinkEntity, "link")
          .select()
          .distinct()
          .loadAllRelationIds({
            relations: ["events", "keywords"],
          }),
        (q) => {
          if (title._tag === "Some") {
            return q.where("lower(link.title) LIKE :title", {
              title: `%${title.value.toLowerCase()}%`,
            });
          }

          if (ids._tag === "Some") {
            return q.where("link.id IN (:...ids)", {
              ids: ids.value,
            });
          }

          if (events._tag === "Some") {
            return q.where("events.id IN (:...events)", {
              events: events.value,
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
                [`link.${k}`]: v,
              })
            );
            ctx.logger.debug.log("Ordering %O", order);
            return q.orderBy(order);
          }
          return q;
        },
        (q) => {
          //   ctx.logger.debug.log(
          //     "Get links query %s, %O",
          //     q.getSql(),
          //     q.getParameters()
          //   );
          return ctx.db.execQuery(() =>
            q.skip(findOptions.skip).take(findOptions.take).getManyAndCount()
          );
        }
      );

      return pipe(
        listGroupsMembersTE,
        TE.chainEitherK(([results, total]) =>
          pipe(
            results,
            A.traverse(E.Applicative)(toLinkIO),
            E.map((data) => ({ data, total }))
          )
        ),
        TE.map((body) => ({
          body,
          statusCode: 200,
        }))
      );
    }
  );
};
