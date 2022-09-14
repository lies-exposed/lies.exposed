import { AddEndpoint, Endpoints } from "@liexp/shared/endpoints";
import { Router } from "express";
import * as A from "fp-ts/lib/Array";
import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import * as t from "io-ts";
import { toImageIO } from "./media.io";
import { MediaEntity } from "@entities/Media.entity";
import { RouteContext } from "@routes/route.types";
import { addOrder, getORMOptions } from "@utils/orm.utils";

export const MakeListMediaRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(
    Endpoints.Media.List,
    ({
      query: { events, ids, description, type: _type, emptyEvents, ...query },
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
        ...findOptions,
      });

      const findTask = pipe(
        ctx.db.manager
          .getRepository(MediaEntity)
          .createQueryBuilder("media")
          .leftJoinAndSelect("media.events", "events")
          .leftJoinAndSelect("media.links", "links"),
        (q) => {
          if (O.isSome(description)) {
            return q.where("lower(media.description) LIKE :description", {
              description: `%${description.value.toLowerCase()}%`,
            });
          }

          if (O.isSome(ids)) {
            return q.where("media.id IN (:...ids)", {
              ids: ids.value,
            });
          }

          if (O.isSome(type)) {
            return q.where("media.type IN (:...types)", {
              types: type.value,
            });
          }

          if (O.isSome(events)) {
            return q.where("events.id IN (:...eventIds)", {
              eventIds: events.value,
            });
          } else if (O.isSome(emptyEvents)) {
            if (emptyEvents) {
              return q.where("events.id IS NULL");
            }
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
          // ctx.logger.debug.log("SQL %s", q.getSql());
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
            })),
            A.traverse(E.Applicative)(toImageIO),
            TE.fromEither,
            TE.map((results) => ({
              total,
              data: results,
            }))
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
    }
  );
};
