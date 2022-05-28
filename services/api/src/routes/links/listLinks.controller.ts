import { AddEndpoint, Endpoints } from "@liexp/shared/endpoints";
import { Router } from "express";
import * as A from "fp-ts/lib/Array";
import * as E from "fp-ts/lib/Either";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { RouteContext } from "../route.types";
import { toLinkIO } from "./link.io";
import { LinkEntity } from "@entities/Link.entity";
import { toControllerError } from "@io/ControllerError";
import { addOrder, getORMOptions } from "@utils/orm.utils";

export const MakeListLinksRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(
    Endpoints.Link.List,
    ({ query: { events, ids, title, emptyEvents, ...query } }) => {
      const findOptions = getORMOptions(
        { ...query },
        ctx.env.DEFAULT_PAGE_SIZE
      );

      ctx.logger.debug.log(`find Options %O`, {
        events,
        ids,
        title,
        emptyEvents,
        ...findOptions,
      });

      const listGroupsMembersTE = TE.tryCatch(
        () =>
          pipe(
            ctx.db.manager
              .createQueryBuilder(LinkEntity, "link")
              .leftJoinAndSelect("link.image", "image")
              .leftJoinAndSelect("link.events", "events")
              .leftJoinAndSelect("link.keywords", "keywords"),
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

              if (emptyEvents._tag === "Some") {
                if (emptyEvents.value) {
                  return q.where("events.id IS NULL");
                }
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
                return addOrder(findOptions.order, q, "link");
              }
              return q;
            },
            (q) => {
              // ctx.logger.debug.log(
              //   "Get links query %s, %O",
              //   q.getSql(),
              //   q.getParameters()
              // );
              return q
                .skip(findOptions.skip)
                .take(findOptions.take)
                .getManyAndCount();
            }
          ),
        toControllerError
      );

      return pipe(
        listGroupsMembersTE,
        TE.chainEitherK(([results, total]) =>
          pipe(
            results.map((r) => ({
              ...r,
              events: r.events.map((e) => e.id) as any[],
            })),
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
