import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type GetListLinkQuery } from "@liexp/shared/lib/io/http/Link.js";
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
    onlyDeleted,
    provider,
    creator,
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
            .leftJoinAndSelect("link.events", "events"),
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
            if (O.isSome(search)) {
              return q.where(
                "lower(link.title) LIKE :q OR lower(link.description) LIKE :q",
                {
                  q: `%${search.value.toLowerCase()}%`,
                },
              );
            }

            if (O.isSome(creator)) {
              return q.where("creator.id = :creator", {
                creator: creator.value,
              });
            }

            if (O.isSome(provider)) {
              return q.where("link.provider = :provider", {
                provider: provider.value,
              });
            }

            if (O.isSome(ids) && ids.value.length > 0) {
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
              return q.where("keywords.id IN (:...keywordIds)", {
                keywordIds: keywords.value,
              });
            }

            if (O.isSome(noPublishDate)) {
              q.andWhere("link.publishDate IS NULL");
            }

            if (O.isSome(onlyDeleted)) {
              if (onlyDeleted.value) {
                q.withDeleted().where("link.deletedAt IS NOT NULL");
              }
            }

            if (O.isSome(onlyUnshared)) {
              q.andWhere(
                '"socialPosts_spCount" < 1 OR "socialPosts_spCount" IS NULL',
              );
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
