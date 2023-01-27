import { AddEndpoint, Endpoints } from "@liexp/shared/endpoints";
import { type Router } from "express";
import * as A from "fp-ts/Array";
import * as E from "fp-ts/Either";
import * as O from "fp-ts/Option";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { type RouteContext } from "../route.types";
import { toLinkIO } from "./link.io";
import { LinkEntity } from "@entities/Link.entity";
import { toControllerError } from "@io/ControllerError";
import { addOrder, getORMOptions } from "@utils/orm.utils";

export const MakeListLinksRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(
    Endpoints.Link.List,
    (
      {
        query: {
          events,
          keywords,
          ids,
          q: search,
          emptyEvents,
          onlyDeleted,
          provider,
          creator,
          ...query
        },
      },
      req
    ) => {
      const findOptions = getORMOptions(
        { ...query },
        ctx.env.DEFAULT_PAGE_SIZE
      );

      ctx.logger.debug.log(`find Options %O`, {
        events,
        ids,
        search,
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
              .leftJoinAndSelect("link.keywords", "keywords")
              .loadAllRelationIds({ relations: ["creator"] }),
            (q) => {
              if (O.isSome(search)) {
                return q.where(
                  "lower(link.title) LIKE :q OR lower(link.description) LIKE :q",
                  {
                    q: `%${search.value.toLowerCase()}%`,
                  }
                );
              }

              if (O.isSome(creator)) {
                return q.where("link.creator = :creator", {
                  creator: creator.value,
                });
              }

              if (O.isSome(provider)) {
                return q.where("link.provider = :provider", {
                  provider: provider.value,
                });
              }

              if (O.isSome(ids)) {
                return q.where("link.id IN (:...ids)", {
                  ids: ids.value,
                });
              }

              if (O.isSome(emptyEvents)) {
                if (emptyEvents.value) {
                  return q.where("events.id IS NULL");
                }
              }

              if (O.isSome(events)) {
                return q.where("events.id IN (:...eventIds)", {
                  eventIds: events.value,
                });
              }

              if (O.isSome(keywords)) {
                return q.where('keywords.id IN (:...keywordIds)', {
                  keywordIds: keywords.value
                })
              }

              if (O.isSome(onlyDeleted)) {
                if (onlyDeleted.value) {
                  q.withDeleted().where("link.deletedAt IS NOT NULL");
                }
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
              keywords: r.keywords.map((e) => e.id) as any[],
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
