import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type http } from "@liexp/shared/lib/io/index.js";
import * as t from "io-ts";
import { Brackets } from "typeorm";
import { MediaEntity } from "#entities/Media.entity.js";
import { type TEFlow } from "#flows/flow.types.js";
import { leftJoinSocialPosts } from "#queries/socialPosts/leftJoinSocialPosts.query.js";
import { addOrder, getORMOptions } from "#utils/orm.utils.js";

const defaultQuery: http.Media.GetListMediaQuery = {
  type: fp.O.none,
  ids: fp.O.none,
  exclude: fp.O.none,
  creator: fp.O.none,
  events: fp.O.none,
  areas: fp.O.none,
  keywords: fp.O.none,
  locations: fp.O.none,
  q: fp.O.none,
  startDate: fp.O.none,
  endDate: fp.O.none,
  emptyThumbnail: fp.O.none,
  emptyEvents: fp.O.none,
  emptyLinks: fp.O.none,
  emptyAreas: fp.O.none,
  includeDeleted: fp.O.none,
  spCount: fp.O.none,
  onlyUnshared: fp.O.none,
  needRegenerateThumbnail: fp.O.none,
  _sort: fp.O.some("updatedAt"),
  _order: fp.O.some("DESC"),
  _end: fp.O.some(20 as any),
  _start: fp.O.some(0 as any),
};
export const fetchManyMedia: TEFlow<
  [Partial<http.Media.GetListMediaQuery>],
  [MediaEntity[], number]
> = (ctx) => (_query) => {
  const query = { ...defaultQuery, ..._query };
  const {
    q: search,
    ids,
    creator,
    type: _type,
    keywords,
    events,
    areas,
    emptyEvents,
    emptyLinks,
    emptyThumbnail,
    emptyAreas,
    includeDeleted,
    exclude,
    spCount,
    onlyUnshared,
    needRegenerateThumbnail,
    ...ormQuery
  } = query;

  const findOptions = getORMOptions({ ...ormQuery }, ctx.env.DEFAULT_PAGE_SIZE);

  const type = pipe(
    _type,
    fp.O.map((tp) => (t.array(t.string).is(tp) ? tp : [tp])),
  );

  return pipe(
    ctx.db.manager
      .getRepository(MediaEntity)
      .createQueryBuilder("media")
      .leftJoinAndSelect("media.events", "events")
      .leftJoinAndSelect("media.keywords", "keywords")
      .leftJoinAndSelect("media.links", "links")
      .leftJoinAndSelect("media.areas", "areas")
      .leftJoinAndSelect(
        leftJoinSocialPosts("media"),
        "socialPosts",
        '"socialPosts"."socialPosts_entity" = media.id',
      )
      .loadAllRelationIds({ relations: ["creator"] }),
    (q) => {
      let hasWhere = false;
      if (fp.O.isSome(search)) {
        q.where(
          new Brackets((qb) =>
            qb.where(
              "lower(media.description) LIKE :search OR lower(media.label) LIKE :search",
              {
                search: `%${search.value.toLowerCase()}%`,
              },
            ),
          ),
        );

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

      if (fp.O.isSome(emptyThumbnail) && emptyThumbnail.value) {
        const where = hasWhere ? q.andWhere.bind(q) : q.where.bind(q);
        where("media.thumbnail IS NULL");
        hasWhere = true;
      }

      if (fp.O.isSome(emptyLinks) && emptyLinks.value) {
        const where = hasWhere ? q.andWhere.bind(q) : q.where.bind(q);
        where("links.id IS NULL");
        hasWhere = true;
      }

      if (fp.O.isSome(areas)) {
        const where = hasWhere ? q.andWhere.bind(q) : q.where.bind(q);
        where("areas.id IN (:...areaIds)", {
          areaIds: areas.value,
        });
        hasWhere = true;
      } else if (fp.O.isSome(emptyAreas) && emptyAreas.value) {
        const where = hasWhere ? q.andWhere.bind(q) : q.where.bind(q);
        where("areas.id IS NULL");
        hasWhere = true;
      }

      if (fp.O.isSome(spCount)) {
        q.andWhere('"socialPosts_spCount" >= :spCount', {
          spCount: spCount.value,
        });
      } else if (fp.O.isSome(onlyUnshared)) {
        q.andWhere(
          '"socialPosts_spCount" < 1 OR "socialPosts_spCount" IS NULL',
        );
      }

      if (fp.O.isSome(needRegenerateThumbnail)) {
        q.andWhere(
          `"media"."extra" ->> 'needRegenerateThumbnail' = :needRegenerateThumbnail`,
          {
            needRegenerateThumbnail: needRegenerateThumbnail.value,
          },
        );
      }

      // include deleted
      pipe(
        includeDeleted,
        fp.O.fold(
          () => {},
          () => {
            q.andWhere("media.deletedAt IS NOT NULL").withDeleted();
          },
        ),
      );

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
      // ctx.logger.debug.log(
      //   "Skip %d, take %d",
      //   findOptions.skip,
      //   findOptions.take,
      // );

      // ctx.logger.debug.log(q.getSql(), q.getParameters());

      return q.skip(findOptions.skip).take(findOptions.take);
    },
    (q) => ctx.db.execQuery(() => q.getManyAndCount()),
  );
};
