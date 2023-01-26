import { AddEndpoint, Endpoints } from "@liexp/shared/endpoints";
import { type Router } from "express";
import * as A from "fp-ts/Array";
import * as E from "fp-ts/Either";
import * as O from "fp-ts/Option";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import * as t from "io-ts";
import { toImageIO } from "./media.io";
import { MediaEntity } from "@entities/Media.entity";
import { type RouteContext } from "@routes/route.types";
import { addOrder, getORMOptions } from "@utils/orm.utils";

export const MakeListMediaRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(
    Endpoints.Media.List,
    ({
      query: {
        events,
        ids,
        description,
        type: _type,
        emptyEvents,
        deletedOnly,
        creator,
        keywords,
        ...query
      },
    }) => {
      const findOptions = getORMOptions(
        { ...query },
        ctx.env.DEFAULT_PAGE_SIZE
      );

      const type = pipe(
        _type,
        O.map((tp) => (t.array(t.string).is(tp) ? tp : [tp]))
      );

      ctx.logger.debug.log(`Find Options %O`, {
        events,
        ids,
        description,
        type,
        emptyEvents,
        deletedOnly,
        ...findOptions,
      });

      const findTask = pipe(
        ctx.db.manager
          .getRepository(MediaEntity)
          .createQueryBuilder("media")
          .leftJoinAndSelect("media.events", "events")
          .leftJoinAndSelect('media.keywords', 'keywords')
          .leftJoinAndSelect("media.links", "links")
          .loadAllRelationIds({ relations: ["creator"] }),
        (q) => {
          let hasWhere = false;
          if (O.isSome(description)) {
            q.where("lower(media.description) LIKE :description", {
              description: `%${description.value.toLowerCase()}%`,
            });
            hasWhere = true;
          }

          if (O.isSome(ids)) {
            const where = hasWhere ? q.andWhere.bind(q) : q.where.bind(q);
            where("media.id IN (:...ids)", {
              ids: ids.value,
            });
            hasWhere = true;
          }

          if (O.isSome(creator)) {
            const where = hasWhere ? q.andWhere.bind(q) : q.where.bind(q);
            where("media.creator = :creator", {
              creator: creator.value,
            });
            return q;
          }

          if (O.isSome(type)) {
            const where = hasWhere ? q.andWhere.bind(q) : q.where.bind(q);
            where("media.type IN (:...types)", {
              types: type.value,
            });
            hasWhere = true;
          }

          if (O.isSome(keywords)) {
            const where = hasWhere ? q.andWhere.bind(q) : q.where.bind(q);
            where("keywords.id IN (:...keywordIds)", {
              keywordIds: keywords.value,
            });
            hasWhere = true;
          }

          if (O.isSome(events)) {
            const where = hasWhere ? q.andWhere.bind(q) : q.where.bind(q);
            where("events.id IN (:...eventIds)", {
              eventIds: events.value,
            });
            hasWhere = true;
          } else if (O.isSome(emptyEvents)) {
            if (emptyEvents.value) {
              const where = hasWhere ? q.andWhere.bind(q) : q.where.bind(q);
              where("events.id IS NULL");
              hasWhere = true;
            }
          }

          const includeDeleted = pipe(
            deletedOnly,
            O.getOrElse(() => false)
          );
          if (includeDeleted) {
            q.where("media.deletedAt IS NOT NULL").withDeleted();
          }

          return q;
        },
        (q) => {
          if (findOptions.order !== undefined) {
            // ctx.logger.debug.log("Order %O", findOptions.order);
            return addOrder(findOptions.order, q, "media");
          }
          return q;
        },
        (q) => {
          ctx.logger.debug.log(
            "Skip %d, take %d",
            findOptions.skip,
            findOptions.take
          );
          return q.skip(findOptions.skip).take(findOptions.take);
        },
        (q) => {
          ctx.logger.debug.log("SQL %s", q.getSql());
          return ctx.db.execQuery(() => q.getManyAndCount());
        }
      );

      return pipe(
        findTask,
        TE.chain(([data, total]) =>
          pipe(
            data,
            A.map((d) => ({
              ...d,
              links: d.links.map((l) => l.id) as any[],
              events: d.events.map((e) => e.id) as any[],
              keywords: d.keywords.map((e) => e.id) as any[],
            })),
            A.traverse(E.Applicative)(toImageIO),
            TE.fromEither,
            TE.map((results) => ({
              total,
              data: results,
            }))
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
