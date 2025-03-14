import { MediaEntity } from "@liexp/backend/lib/entities/Media.entity.js";
import { leftJoinSocialPosts } from "@liexp/backend/lib/queries/social-post/leftJoinSocialPosts.query.js";
import { addOrder, getORMOptions } from "@liexp/backend/lib/utils/orm.utils.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { http } from "@liexp/shared/lib/io/index.js";
import * as t from "io-ts";
import { Brackets } from "typeorm";
import { type TEReader } from "#flows/flow.types.js";

export const fetchManyMedia =
  (
    _query: Partial<http.Media.GetListMediaQuery>,
  ): TEReader<[MediaEntity[], number]> =>
  (ctx) => {
    const query = { ...http.Media.GetListMediaQueryMonoid.empty, ..._query };
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
      hasExtraThumbnailsError,
      ...ormQuery
    } = query;

    const findOptions = getORMOptions(
      { ...ormQuery },
      ctx.env.DEFAULT_PAGE_SIZE,
    );

    const type = pipe(
      _type,
      fp.O.map((tp) => (Schema.Array(Schema.String).is(tp) ? tp : [tp])),
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
          if (needRegenerateThumbnail.value) {
            q.andWhere(
              new Brackets((qb) => {
                return qb
                  .where(
                    `("media"."extra" ->> 'needRegenerateThumbnail')::boolean = 'true'`,
                  )
                  .orWhere("media.extra -> 'needRegenerateThumbnail' is null ");
              }),
            );
          } else {
            q.andWhere(`"media"."extra" ->> 'needRegenerateThumbnail' = false`);
          }
        }

        if (fp.O.isSome(hasExtraThumbnailsError)) {
          if (hasExtraThumbnailsError.value) {
            q.andWhere(
              new Brackets((qb) => {
                return qb
                  .where(
                    `("media"."extra" -> 'thumbnails' ->> 'error') IS NOT NULL`,
                  )
                  .orWhere(
                    `("media"."extra" -> 'thumbnails' ->> 'error') != ''`,
                  );
              }),
            );
          } else {
            q.andWhere(
              new Brackets((qb) => {
                return qb
                  .where(
                    `("media"."extra" -> 'thumbnails' ->> 'error')::text IS NULL`,
                  )
                  .orWhere(
                    `("media"."extra" -> 'thumbnails' ->> 'error'::text)::text = ''`,
                  );
              }),
            );
          }
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
