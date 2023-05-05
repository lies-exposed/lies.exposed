import { fp } from "@liexp/core/lib/fp";
import { type http } from "@liexp/shared/lib/io";
import { pipe } from "fp-ts/lib/function";
import * as t from "io-ts";
import { MediaEntity } from "@entities/Media.entity";
import { type TEFlow } from "@flows/flow.types";
import { addOrder, getORMOptions } from "@utils/orm.utils";

const defaultQuery: http.Media.GetListMediaQuery = {
  type: fp.O.none,
  ids: fp.O.none,
  exclude: fp.O.none,
  creator: fp.O.none,
  description: fp.O.none,
  events: fp.O.none,
  keywords: fp.O.none,
  emptyEvents: fp.O.none,
  emptyLinks: fp.O.none,
  deletedOnly: fp.O.none,
  _sort: fp.O.some("updatedAt"),
  _order: fp.O.some("DESC"),
  _end: fp.O.some(20 as any),
  _start: fp.O.some(0 as any),
};
export const fetchManyMedia: TEFlow<
  [Partial<http.Media.GetListMediaQuery>],
  [MediaEntity[], number]
> = (ctx) => (query) => {
  const q = { ...defaultQuery, ...query };
  const {
    description,
    ids,
    creator,
    type: _type,
    keywords,
    events,
    emptyEvents,
    emptyLinks,
    deletedOnly,
    exclude,
    ...ormQuery
  } = q;

  const findOptions = getORMOptions({ ...ormQuery }, ctx.env.DEFAULT_PAGE_SIZE);

  const type = pipe(
    _type,
    fp.O.map((tp) => (t.array(t.string).is(tp) ? tp : [tp]))
  );

  return pipe(
    ctx.db.manager
      .getRepository(MediaEntity)
      .createQueryBuilder("media")
      .leftJoinAndSelect("media.events", "events")
      .leftJoinAndSelect("media.keywords", "keywords")
      .leftJoinAndSelect("media.links", "links")
      .loadAllRelationIds({ relations: ["creator"] }),
    (q) => {
      let hasWhere = false;
      if (fp.O.isSome(description)) {
        q.where("lower(media.description) LIKE lower(:description)", {
          description: `%${description.value.toLowerCase()}%`,
        });
        hasWhere = true;
      }

      if (fp.O.isSome(exclude)) {
        q.where("media.id NOT IN(:...ids)", {
          ids: exclude.value,
        });
        hasWhere = true;
      }

      if (fp.O.isSome(ids)) {
        const where = hasWhere ? q.andWhere.bind(q) : q.where.bind(q);
        where("media.id IN (:...ids)", {
          ids: ids.value,
        });
        hasWhere = true;
      }

      if (fp.O.isSome(creator)) {
        const where = hasWhere ? q.andWhere.bind(q) : q.where.bind(q);
        where("media.creator = :creator", {
          creator: creator.value,
        });
        return q;
      }

      if (fp.O.isSome(type)) {
        const where = hasWhere ? q.andWhere.bind(q) : q.where.bind(q);
        where("media.type IN (:...types)", {
          types: type.value,
        });
        hasWhere = true;
      }

      if (fp.O.isSome(keywords)) {
        const where = hasWhere ? q.andWhere.bind(q) : q.where.bind(q);
        where("keywords.id IN (:...keywordIds)", {
          keywordIds: keywords.value,
        });
        hasWhere = true;
      }

      if (fp.O.isSome(events)) {
        const where = hasWhere ? q.andWhere.bind(q) : q.where.bind(q);
        where("events.id IN (:...eventIds)", {
          eventIds: events.value,
        });
        hasWhere = true;
      } else if (fp.O.isSome(emptyEvents)) {
        if (emptyEvents.value) {
          const where = hasWhere ? q.andWhere.bind(q) : q.where.bind(q);
          where("events.id IS NULL");
          hasWhere = true;
        }
      }

      if (fp.O.isSome(emptyLinks) && emptyLinks.value) {
        const where = hasWhere ? q.andWhere.bind(q) : q.where.bind(q);
        where("links.id IS NULL");
        hasWhere = true;
      }

      const includeDeleted = pipe(
        deletedOnly,
        fp.O.getOrElse(() => false)
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
};
