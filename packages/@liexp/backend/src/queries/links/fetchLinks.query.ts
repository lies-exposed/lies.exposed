import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type GetListLinkQuery } from "@liexp/io/lib/http/Link.js";
import { type Schema } from "effect";
import * as O from "effect/Option";
import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import { type DatabaseContext } from "../../context/db.context.js";
import { type ENVContext } from "../../context/env.context.js";
import { LinkEntity } from "../../entities/Link.entity.js";
import { type DBError } from "../../providers/orm/database.provider.js";
import {
  aggregateSocialPostsPerEntry,
  leftJoinSocialPosts,
} from "../../queries/social-post/leftJoinSocialPosts.query.js";
import { DBService } from "../../services/db.service.js";
import { addOrder } from "../../utils/orm.utils.js";

export const getListQueryEmpty: GetListLinkQuery = {
  q: O.none(),
  ids: O.none(),
  _sort: O.none(),
  _order: O.none(),
  onlyDeleted: O.none(),
  onlyUnshared: O.none(),
  provider: O.none(),
  creator: O.none(),
  url: O.none(),
  noPublishDate: O.none(),
  events: O.none(),
  emptyEvents: O.none(),
  eventsCount: O.none(),
  keywords: O.none(),
  startDate: O.none(),
  endDate: O.none(),
  _start: O.some(0 as typeof Schema.Int.Type),
  _end: O.some(20 as typeof Schema.Int.Type),
};

export const fetchLinks = <C extends DatabaseContext & ENVContext>(
  query: Partial<GetListLinkQuery>,
  isAdmin: boolean,
): ReaderTaskEither<C, DBError, [LinkEntity[], number]> => {
  const {
    events,
    keywords,
    ids,
    q: search,
    emptyEvents,
    eventsCount,
    onlyDeleted,
    provider,
    creator,
    url,
    onlyUnshared: _onlyUnshared,
    noPublishDate: _noPublishDate,
    ...others
  } = { ...getListQueryEmpty, ...query };

  // const findOptions = getORMOptions({ ...others }, ctx.env.DEFAULT_PAGE_SIZE);
  const onlyUnshared = pipe(
    _onlyUnshared,
    O.filter((o) => !!o),
  );
  const noPublishDate = pipe(
    _noPublishDate,
    O.filter((o) => !!o),
  );

  return pipe(
    fp.RTE.Do,
    fp.RTE.apS(
      "findOptions",
      pipe(DBService.getORMOptions({ ...others }), fp.RTE.fromReader),
    ),
    // LoggerService.RTE.debug([
    //   `find Options %O`,
    //   {
    //     events,
    //     ids,
    //     search,
    //     emptyEvents,
    //     onlyDeleted,
    //     onlyUnshared,
    //     ...findOptions,
    //   },
    // ]),
    fp.RTE.chain(({ findOptions }) =>
      DBService.execQuery((em) =>
        pipe(
          em
            .createQueryBuilder(LinkEntity, "link")
            .leftJoinAndSelect("link.creator", "creator")
            .leftJoinAndSelect("link.image", "image")
            .leftJoinAndSelect("link.keywords", "keywords")
            .leftJoinAndSelect(
              "link.events",
              "events",
              "events.deletedAt IS NULL",
            ),
          (q) => {
            if (isAdmin) {
              return q.leftJoinAndSelect(
                leftJoinSocialPosts("links"),
                "socialPosts",
                'link.id = "socialPosts"."socialPosts_entity"',
              );
            }
            return q;
          },
          (q) => {
            let hasWhere = false;

            if (O.isSome(search)) {
              q.where(
                "lower(link.title) LIKE :q OR lower(link.description) LIKE :q",
                {
                  q: `%${search.value.toLowerCase()}%`,
                },
              );
              hasWhere = true;
            }

            if (O.isSome(creator)) {
              if (hasWhere) {
                q.andWhere("creator.id = :creator", {
                  creator: creator.value,
                });
              } else {
                q.where("creator.id = :creator", {
                  creator: creator.value,
                });
                hasWhere = true;
              }
            }

            if (O.isSome(provider)) {
              if (hasWhere) {
                q.andWhere("link.provider = :provider", {
                  provider: provider.value,
                });
              } else {
                q.where("link.provider = :provider", {
                  provider: provider.value,
                });
                hasWhere = true;
              }
            }

            if (O.isSome(url)) {
              if (hasWhere) {
                q.andWhere("link.url = :url", {
                  url: url.value,
                });
              } else {
                q.where("link.url = :url", {
                  url: url.value,
                });
                hasWhere = true;
              }
            }

            if (O.isSome(ids) && ids.value.length > 0) {
              if (hasWhere) {
                q.andWhere("link.id IN (:...ids)", {
                  ids: ids.value,
                });
              } else {
                q.where("link.id IN (:...ids)", {
                  ids: ids.value,
                });
                hasWhere = true;
              }
            }

            if (O.isSome(emptyEvents)) {
              if (emptyEvents.value) {
                if (hasWhere) {
                  q.andWhere("events.id IS NULL");
                } else {
                  q.where("events.id IS NULL");
                  hasWhere = true;
                }
              }
            }

            if (O.isSome(events)) {
              if (hasWhere) {
                q.andWhere("events.id IN (:...eventIds)", {
                  eventIds: events.value,
                });
              } else {
                q.where("events.id IN (:...eventIds)", {
                  eventIds: events.value,
                });
                hasWhere = true;
              }
            }

            if (O.isSome(keywords)) {
              if (hasWhere) {
                q.andWhere("keywords.id IN (:...keywordIds)", {
                  keywordIds: keywords.value,
                });
              } else {
                q.where("keywords.id IN (:...keywordIds)", {
                  keywordIds: keywords.value,
                });
                hasWhere = true;
              }
            }

            if (O.isSome(noPublishDate)) {
              q.andWhere("link.publishDate IS NULL");
            }

            if (O.isSome(onlyDeleted)) {
              if (onlyDeleted.value) {
                if (hasWhere) {
                  q.withDeleted().andWhere("link.deletedAt IS NOT NULL");
                } else {
                  q.withDeleted().where("link.deletedAt IS NOT NULL");
                  hasWhere = true;
                }
              }
            }

            if (O.isSome(onlyUnshared)) {
              q.andWhere(
                '"socialPosts_spCount" < 1 OR "socialPosts_spCount" IS NULL',
              );
            }

            if (O.isSome(eventsCount)) {
              q.andWhere((qb) => {
                const subQuery = qb
                  .subQuery()
                  .select('"eventLink"."linkId"')
                  .from("event_v2_links_link", "eventLink")
                  .innerJoin(
                    "event_v2",
                    "evt",
                    'evt.id = "eventLink"."eventV2Id" AND evt."deletedAt" IS NULL',
                  )
                  .groupBy('"eventLink"."linkId"')
                  .having("COUNT(evt.id) >= :eventsCount", {
                    eventsCount: eventsCount.value,
                  })
                  .getQuery();
                return `link.id IN ${subQuery}`;
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
          async (q) => {
            // ctx.logger.debug.log(
            //   "Get links query %s, %O",
            //   q.getSql(),
            //   q.getParameters(),
            // );

            q.skip(findOptions.skip).take(findOptions.take);

            return q.getRawAndEntities().then(async (results) => {
              const count = await q.getCount();

              const entities = results.entities.map((e) => ({
                ...e,
                socialPosts: aggregateSocialPostsPerEntry(
                  "link_id",
                  results.raw,
                  e,
                ),
              }));
              return [entities, count];
            });
          },
        ),
      ),
    ),
  );
};
