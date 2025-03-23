import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type GetListLinkQuery } from "@liexp/shared/lib/io/http/Link.js";
import { type Schema } from "effect";
import { None, type Option } from "fp-ts/lib/Option.js";
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

const getListQueryEmpty: GetListLinkQuery = {
  q: fp.O.none,
  ids: fp.O.none,
  _sort: fp.O.none,
  _order: fp.O.none,
  onlyDeleted: fp.O.none,
  onlyUnshared: fp.O.none,
  provider: fp.O.none,
  creator: fp.O.none,
  url: fp.O.none,
  noPublishDate: fp.O.none,
  events: fp.O.none,
  emptyEvents: fp.O.none,
  keywords: fp.O.none,
  startDate: fp.O.none,
  endDate: fp.O.none,
  _start: fp.O.some(20 as typeof Schema.Int.Type),
  _end: fp.O.some(0 as typeof Schema.Int.Type),
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
    fp.O.filter((o) => !!o),
  );
  const noPublishDate = pipe(
    _noPublishDate,
    fp.O.filter((o) => !!o),
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
            if (fp.O.isSome(search)) {
              return q.where(
                "lower(link.title) LIKE :q OR lower(link.description) LIKE :q",
                {
                  q: `%${search.value.toLowerCase()}%`,
                },
              );
            }

            if (fp.O.isSome(creator)) {
              return q.where("creator.id = :creator", {
                creator: creator.value,
              });
            }

            if (fp.O.isSome(provider)) {
              return q.where("link.provider = :provider", {
                provider: provider.value,
              });
            }

            if (fp.O.isSome(ids) && ids.value.length > 0) {
              return q.where("link.id IN (:...ids)", {
                ids: ids.value,
              });
            }

            if (fp.O.isSome(emptyEvents)) {
              if (emptyEvents.value) {
                return q.where("events.id IS NULL");
              }
            }

            if (fp.O.isSome(events)) {
              return q.where("events.id IN (:...eventIds)", {
                eventIds: events.value,
              });
            }

            if (fp.O.isSome(keywords)) {
              return q.where("keywords.id IN (:...keywordIds)", {
                keywordIds: keywords.value,
              });
            }

            if (fp.O.isSome(noPublishDate)) {
              q.andWhere("link.publishDate IS NULL");
            }

            if (fp.O.isSome(onlyDeleted)) {
              if (onlyDeleted.value) {
                q.withDeleted().where("link.deletedAt IS NOT NULL");
              }
            }

            if (fp.O.isSome(onlyUnshared)) {
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
                ) as any[],
              }));
              return [entities, count];
            });
          },
        ),
      ),
    ),
  );
};
