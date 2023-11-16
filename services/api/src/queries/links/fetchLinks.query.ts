import { fp, pipe } from "@liexp/core/lib/fp";
import { type GetListLinkQuery } from "@liexp/shared/lib/io/http/Link";
import { LinkEntity } from "@entities/Link.entity";
import { type TEFlow } from "@flows/flow.types";
import { toControllerError } from "@io/ControllerError";
import { aggregateSocialPostsPerEntry, leftJoinSocialPosts } from "@queries/socialPosts/leftJoinSocialPosts.query";
import { addOrder, getORMOptions } from "@utils/orm.utils";

export const fetchLinks: TEFlow<
  [GetListLinkQuery, boolean],
  [ LinkEntity[], number]
> = (ctx) => (query, isAdmin) => {
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
    ...others
  } = query;

  const findOptions = getORMOptions({ ...others }, ctx.env.DEFAULT_PAGE_SIZE);
  const onlyUnshared = pipe(
    _onlyUnshared,
    fp.O.filter((o) => !!o),
  );

  ctx.logger.debug.log(`find Options %O`, {
    events,
    ids,
    search,
    emptyEvents,
    onlyDeleted,
    onlyUnshared,
    ...findOptions,
  });

  return pipe(
    fp.TE.tryCatch(
      (): Promise<[{ entities: LinkEntity[]; raw: any[] }, number]> =>
        pipe(
          ctx.db.manager
            .createQueryBuilder(LinkEntity, "link")
            .leftJoinAndSelect("link.creator", "creator")
            .leftJoinAndSelect("link.image", "image")
            .leftJoinAndSelect("link.events", "events")
            .leftJoinAndSelect("link.keywords", "keywords"),
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

            if (fp.O.isSome(ids)) {
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
          (q) => {
            ctx.logger.debug.log(
              "Get links query %s, %O",
              q.getSql(),
              q.getParameters(),
            );

            q.skip(findOptions.skip).take(findOptions.take);

            return q.getRawAndEntities().then(async (results) => {
              const count = await q.getCount();

              return [results, count];
            });
          },
        ),
      toControllerError,
    ),
    fp.TE.map(([{ entities, raw }, count]): [LinkEntity[], number] => [
      entities.map((e) => ({
        ...e,
        socialPosts: aggregateSocialPostsPerEntry("link_id", raw, e) as any[],
      })),
      count,
    ]),
  );
};
