// https://www.postgresql.org/docs/12/functions-json.html

import { type DBError } from "@liexp/backend/lib/providers/orm/index.js";
import { fp } from "@liexp/core/lib/fp/index.js";
import { type EventTotals } from "@liexp/shared/lib/io/http/Events/EventTotals.js";
import {
  EventTypes,
  type EventType,
} from "@liexp/shared/lib/io/http/Events/EventType.js";
import { type GetSearchEventsQuery } from "@liexp/shared/lib/io/http/Events/SearchEvents/SearchEventsQuery.js";
import { walkPaginatedRequest } from "@liexp/shared/lib/utils/fp.utils.js";
import * as A from "fp-ts/lib/Array.js";
import * as O from "fp-ts/lib/Option.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { pipe } from "fp-ts/lib/function.js";
import { Brackets, In, type SelectQueryBuilder } from "typeorm";
import { type ControllerError } from "../../../io/ControllerError.js";
import { type RouteContext } from "../../route.types.js";
import { EventV2Entity } from "#entities/Event.v2.entity.js";
import { GroupMemberEntity } from "#entities/GroupMember.entity.js";
import { type EventsConfig } from "#queries/config/index.js";
import {
  aggregateSocialPostsPerEntry,
  leftJoinSocialPosts,
} from "#queries/socialPosts/leftJoinSocialPosts.query.js";
import { addOrder, type ORMOrder } from "#utils/orm.utils.js";

type WhereT = "AND" | "OR";

const getWhere = (
  q: SelectQueryBuilder<EventV2Entity>,
  whereT?: WhereT,
): typeof q.where | typeof q.andWhere | typeof q.orWhere => {
  return whereT === "AND"
    ? q.andWhere.bind(q)
    : whereT === "OR"
      ? q.orWhere.bind(q)
      : q.where.bind(q);
};

export const whereInTitle =
  (config: EventsConfig) =>
  (
    q: SelectQueryBuilder<EventV2Entity>,
    title: string,
  ): SelectQueryBuilder<EventV2Entity> => {
    const trimmedWords = title
      .trim()
      .replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>{}[]\\\/]/gi, " ");

    const tsQueryTitle = trimmedWords
      .split(" ")
      .sort((a, b) => b.length - a.length)
      .slice(0, 3)
      .join(" | ")
      .toLowerCase();

    // logger.debug.log(
    //   "PG ts_query for title '%s' \n '%s'",
    //   trimmedWords,
    //   tsQueryTitle
    // );

    const cases = Object.entries(config).reduce(
      (acc, [key, value]) =>
        acc.concat(
          `WHEN event.type IN ('${key}') THEN ${value.whereTitleIn(q)}`,
        ),
      [""],
    );

    const whereTitle = `ts_rank_cd(
      to_tsvector(
        'english',
        coalesce(
          CASE
            ${cases.join("\n")}
          END, ''
        )
      ),
      to_tsquery('english', :q)
    ) > 0.001`;

    return q.andWhere(whereTitle, {
      q: tsQueryTitle,
    });
  };

export const whereActorInArray =
  (config: EventsConfig) =>
  (
    selectQ: SelectQueryBuilder<EventV2Entity>,
    actors: string[],
    eventType: O.Option<EventType[]>,
    whereT?: WhereT,
  ): SelectQueryBuilder<EventV2Entity> => {
    const outerWhere = getWhere(selectQ, whereT);
    outerWhere(
      new Brackets((q) => {
        Object.entries(config)
          .filter(
            ([key]) =>
              O.isNone(eventType) || eventType.value.includes(key as any),
          )
          .forEach(([eventType, queryConfig], i) => {
            const where = i === 0 ? q.where.bind(q) : q.orWhere.bind(q);
            where(
              new Brackets((qqb) => {
                return queryConfig.whereActorsIn(
                  qqb.where(` event.type = '${eventType}' `),
                  actors,
                );
              }),
            );
          });
        return q;
      }),
    );
    selectQ.setParameter("actors", actors);
    return selectQ;
  };

export const whereGroupInArray =
  (config: EventsConfig) =>
  (
    q: SelectQueryBuilder<EventV2Entity>,
    groups: string[],
    eventType: O.Option<EventType[]>,
    whereT?: WhereT,
  ): SelectQueryBuilder<EventV2Entity> => {
    const outerWhere = getWhere(q, whereT);
    outerWhere(
      new Brackets((subQ) => {
        Object.entries(config)
          .filter(
            ([key]) =>
              O.isNone(eventType) || eventType.value.includes(key as any),
          )
          .forEach(([eventType, fn], i) => {
            const where =
              i === 0 ? subQ.where.bind(subQ) : subQ.orWhere.bind(subQ);
            where(
              new Brackets((qqb) => {
                fn.whereGroupsIn(
                  qqb.where(` event.type = '${eventType}' `),
                  groups,
                );
              }),
            );
          });
        return subQ;
      }),
    );

    return q.setParameter("groups", groups);
  };

type SearchEventQuery = Omit<
  GetSearchEventsQuery,
  | "eventType"
  | "withDeleted"
  | "withDrafts"
  | "_start"
  | "_end"
  | "_sort"
  | "_order"
> & {
  type: O.Option<EventType[]>;
  withDeleted: boolean;
  withDrafts: boolean;
  skip: number;
  take: number;
} & ORMOrder;

const searchQueryDefaults: SearchEventQuery = {
  ids: O.none,
  q: O.none,
  startDate: O.none,
  endDate: O.none,
  exclude: O.none,
  withDeleted: false,
  withDrafts: false,
  spCount: O.none,
  keywords: O.none,
  groups: O.none,
  actors: O.none,
  skip: 0,
  take: 100,
  links: O.none,
  media: O.none,
  locations: O.none,
  type: O.none,
  draft: O.none,
  groupsMembers: O.none,
  emptyLinks: O.none,
  emptyMedia: O.none,
  emptyKeywords: O.none,
  emptyActors: O.none,
  emptyGroups: O.none,
  onlyUnshared: O.none,
  order: {},
  relations: O.none,
};

const addWhereToQueryBuilder = (
  q: SelectQueryBuilder<EventV2Entity>,
  config: EventsConfig,
  opts: Omit<SearchEventQuery, "startDate" | "endDate">,
  groupsMembers: string[],
): SelectQueryBuilder<EventV2Entity> => {
  const {
    exclude,
    ids,
    actors,
    groups,
    groupsMembers: _groupsMembers,
    locations,
    keywords,
    media,
    links,
    type,
    q: title,
    withDrafts,
    draft,
    emptyLinks,
    emptyMedia,
    spCount,
    onlyUnshared: _onlyUnshared,
  } = opts;

  const onlyUnshared = pipe(
    _onlyUnshared,
    fp.O.filter((o) => !!o),
  );

  let hasWhere = false;

  if (O.isSome(ids)) {
    q.where("event.id IN (:...ids)", {
      ids: ids.value,
    });
    return q;
  } else if (O.isSome(exclude)) {
    q.where("event.id NOT IN (:...ids)", {
      ids: exclude.value,
    });
    hasWhere = true;
  }

  if (O.isSome(title)) {
    q = whereInTitle(config)(q, title.value);
  }

  q.andWhere(
    new Brackets((qb) => {
      let hasWhereActor = false;
      if (O.isSome(actors)) {
        whereActorInArray(config)(
          q,
          actors.value,
          type,
          hasWhere ? "AND" : undefined,
        );
        hasWhere = true;
        hasWhereActor = true;
      }

      if (O.isSome(groups)) {
        const whereT = hasWhereActor ? "OR" : hasWhere ? "AND" : undefined;
        whereGroupInArray(config)(q, groups.value, type, whereT);
      }

      if (groupsMembers.length > 0) {
        qb.orWhere(
          `( event.type = 'Uncategorized' AND "event"."payload"::jsonb -> 'groupsMembers' ?| ARRAY[:...groupsMembers] )`,
          {
            groupsMembers,
          },
        );
      }
    }),
  );

  if (O.isSome(locations)) {
    q.andWhere(
      new Brackets((locationQb) => {
        locationQb
          .where(
            ` (event.type = 'Uncategorized' AND "event"."payload"::jsonb -> 'location' ?| ARRAY[:...locations]) `,
          )
          .orWhere(`location.id IN (:...locations)`);
      }),
    );

    q.setParameter("locations", locations.value);
  }

  if (O.isSome(keywords)) {
    q.andWhere("keywords.id IN (:...keywords)", {
      keywords: keywords.value,
    });
  }

  if (O.isSome(emptyMedia) && O.toUndefined(emptyMedia)) {
    q.andWhere("media.id IS NULL");
  } else if (O.isSome(media)) {
    q.andWhere("media.id IN (:...media)", {
      media: media.value,
    });
  }

  if (O.isSome(emptyLinks) && O.toUndefined(emptyLinks)) {
    q.andWhere("links.id IS NULL");
  } else if (O.isSome(links)) {
    const where = hasWhere ? q.andWhere.bind(q) : q.andWhere.bind(q);
    where("links.id IN (:...links)", {
      links: links.value,
    });
  }

  if (O.isSome(spCount)) {
    q.andWhere('"socialPosts_spCount" >= :spCount', {
      spCount: spCount.value,
    });
  } else if (O.isSome(onlyUnshared)) {
    q.andWhere('"socialPosts_spCount" < 1 OR "socialPosts_spCount" IS NULL');
  }

  if (O.isSome(draft)) {
    q.andWhere("event.draft = :draft", { draft: draft.value });
  } else if (!withDrafts) {
    q.andWhere("event.draft = false");
  }
  return q;
};

export interface SearchEventOutput {
  results: EventV2Entity[];
  totals: EventTotals;
  total: number;
  firstDate?: Date;
  lastDate?: Date;
}

export const searchEventV2Query =
  ({ db, logger, config }: RouteContext) =>
  (
    query: Partial<SearchEventQuery>,
  ): TE.TaskEither<DBError, SearchEventOutput> => {
    const opts = {
      ...searchQueryDefaults,
      ...query,
    };

    const {
      actors,
      groupsMembers: _groupsMembers,
      type,
      withDeleted,
      onlyUnshared: _onlyUnshared,
      order,
      skip,
      take,
    } = opts;

    return pipe(
      TE.Do,
      TE.bind("groupsMembers", () =>
        pipe(
          O.isSome(actors)
            ? pipe(
                db.find(GroupMemberEntity, {
                  where: {
                    actor: { id: In(actors.value) },
                  },
                }),
                TE.map(A.map((gm) => gm.id)),
              )
            : TE.right<DBError, string[]>([]),
          TE.map((gm) =>
            O.isSome(_groupsMembers) ? gm.concat(..._groupsMembers.value) : gm,
          ),
        ),
      ),
      TE.bind("firstDate", ({ groupsMembers }) => {
        const dates = pipe(
          db.manager
            .createQueryBuilder(EventV2Entity, "event")
            .addSelect('MIN("event"."date")', "firstDate")
            .addSelect('MAX("event"."date")', "lastDate")
            .leftJoinAndSelect("event.keywords", "keywords")
            .leftJoinAndSelect("event.media", "media")
            .leftJoinAndSelect("event.links", "links"),
          (q) =>
            addWhereToQueryBuilder(q, config.events, opts, groupsMembers)
              .addGroupBy('"event"."id"')
              .addGroupBy('"keywords"."id"')
              .addGroupBy('"media"."id"')
              .addGroupBy('"links"."id"'),
          (q) => addOrder({ date: "ASC" }, q, "event"),
        );

        logger.debug.log(
          `Dates query %s with params %O`,
          ...dates.getQueryAndParameters(),
        );

        return db.execQuery(() => dates.getRawOne<{ firstDate: Date }>());
      }),
      TE.bind("lastDate", ({ groupsMembers }) => {
        const dates = pipe(
          db.manager
            .createQueryBuilder(EventV2Entity, "event")
            .addSelect('MAX("event"."date")', "lastDate")
            .leftJoinAndSelect("event.keywords", "keywords")
            .leftJoinAndSelect("event.media", "media")
            .leftJoinAndSelect("event.links", "links"),
          (q) =>
            addWhereToQueryBuilder(q, config.events, opts, groupsMembers)
              .addGroupBy('"event"."id"')
              .addGroupBy('"keywords"."id"')
              .addGroupBy('"media"."id"')
              .addGroupBy('"links"."id"'),
          (q) => addOrder({ date: "DESC" }, q, "event"),
        );

        logger.debug.log(
          `Dates query %s with params %O`,
          ...dates.getQueryAndParameters(),
        );

        return db.execQuery(() => dates.getRawOne<{ lastDate: Date }>());
      }),
      TE.bind("results", ({ groupsMembers }) => {
        const queryBuilder = pipe(
          db.manager
            .createQueryBuilder(EventV2Entity, "event")
            .addSelect("RANDOM()", "seeder_random")
            // TODO: should be dynamicly added if needed
            .leftJoinAndSelect("event.keywords", "keywords")
            .leftJoinAndSelect("event.media", "media")
            .leftJoinAndSelect("event.links", "links")
            .leftJoinAndSelect("event.location", "location")
            .leftJoinAndSelect(
              leftJoinSocialPosts("events"),
              "socialPosts",
              '"socialPosts"."socialPosts_entity" = event.id',
            ),
          (q) => {
            logger.debug.log(
              `Find options for event (type: %s) %O`,
              O.toUndefined(type),
              opts,
            );

            const qq = addWhereToQueryBuilder(
              q,
              config.events,
              opts,
              groupsMembers,
            );

            if (O.isSome(opts.startDate)) {
              qq.andWhere("event.date >= :startDate", {
                startDate: opts.startDate.value.toDateString(),
              });
            }

            if (O.isSome(opts.endDate)) {
              qq.andWhere("event.date <= :endDate", {
                endDate: opts.endDate.value.toDateString(),
              });
            }
            return qq;
          },
          (q) => {
            if (withDeleted) {
              q.withDeleted();
            }

            if (order !== undefined) {
              addOrder(order, q, "event");
            }

            q.cache(true);

            const uncategorizedCount = q
              .clone()
              .andWhere(` event.type = 'Uncategorized' `);

            // logger.debug.log(
            //   `Uncategorized count query %O`,
            //   ...uncategorizedCount.getQueryAndParameters()
            // );

            const deathsCount = q.clone().andWhere(" event.type = 'Death' ");

            // logger.debug.log(
            //   `Deaths count query %O`,
            //   ...deathsCount.getQueryAndParameters()
            // );

            const scientificStudiesCount = q
              .clone()
              .andWhere(" event.type = 'ScientificStudy' ");

            // logger.debug.log(
            //   `Scientific Studies count query %O`,
            //   ...scientificStudiesCount.getQueryAndParameters()
            // );
            const patentCount = q.clone().andWhere(" event.type = 'Patent' ");

            const documentariesCount = q
              .clone()
              .andWhere(" event.type::text = 'Documentary' ");

            // logger.debug.log(
            //   `Documentary count query %O`,
            //   ...documentariesCount.getQueryAndParameters()
            // );

            const transactionsCount = q
              .clone()
              .andWhere("event.type = 'Transaction'");

            // logger.debug.log(
            //   `Transaction count query %O`,
            //   ...transactions.getQueryAndParameters()
            // );

            const quotesCount = q
              .clone()
              .andWhere(`event.type = '${EventTypes.QUOTE.value}'`);

            const booksCount = q
              .clone()
              .andWhere(`event.type = '${EventTypes.BOOK.value}'`);

            if (O.isSome(type)) {
              q.andWhere('"event"."type"::text IN (:...types)', {
                types: type.value,
              });
            }

            // logger.debug.log(
            //   `Search event v2 query %s with params %O`,
            //   ...q.getQueryAndParameters(),
            // );

            return {
              resultsQuery: q,
              booksCount,
              uncategorizedCount,
              deathsCount,
              scientificStudiesCount,
              patentCount,
              documentariesCount,
              transactionsCount,
              quotesCount,
            };
          },
        );

        return fp.sequenceS(fp.TE.ApplicativePar)({
          results: db.execQuery(async () => {
            const resultQ = queryBuilder.resultsQuery
              .loadAllRelationIds({
                relations: ["keywords", "links", "media", "location"],
              })
              .skip(skip)
              .take(take);

            if (skip === 0 && take === 0) {
              return [];
            }

            // logger.debug.log("Result query %s", resultQ.getQueryAndParameters());

            const results = await resultQ.getRawAndEntities();

            // logger.debug.log("Result entities %O", results.entities);
            // logger.debug.log("Raw results %O", results.raw);

            return results.entities.map((e) => ({
              ...e,
              socialPosts: aggregateSocialPostsPerEntry(
                "event_id",
                results.raw,
                e,
              ) as any[],
            }));
          }),
          uncategorized: db.execQuery(() =>
            queryBuilder.uncategorizedCount.getCount(),
          ),
          deaths: db.execQuery(() => queryBuilder.deathsCount.getCount()),
          scientificStudies: db.execQuery(() =>
            queryBuilder.scientificStudiesCount.getCount(),
          ),
          patents: db.execQuery(() => queryBuilder.patentCount.getCount()),
          documentaries: db.execQuery(() =>
            queryBuilder.documentariesCount.getCount(),
          ),
          transactions: db.execQuery(() =>
            queryBuilder.transactionsCount.getCount(),
          ),
          quotes: db.execQuery(() => queryBuilder.quotesCount.getCount()),
          books: db.execQuery(() => queryBuilder.booksCount.getCount()),
        });
      }),

      TE.map(({ results: { results, ...totals }, firstDate, lastDate }) => ({
        results,
        totals,
        firstDate: firstDate?.firstDate,
        lastDate: lastDate?.lastDate,
        total:
          totals.deaths +
          totals.documentaries +
          totals.patents +
          totals.scientificStudies +
          totals.uncategorized +
          totals.transactions +
          totals.quotes +
          totals.books,
      })),
    );
  };

export const infiniteSearchEventQuery =
  (ctx: RouteContext) =>
  (
    query: Partial<SearchEventQuery>,
  ): TE.TaskEither<ControllerError, SearchEventOutput["results"]> => {
    ctx.logger.debug.log("Infinite search event query %O", query);
    return walkPaginatedRequest(ctx)(
      ({ skip, amount }) =>
        searchEventV2Query(ctx)({ ...query, skip, take: amount }),
      (r) => r.total,
      (r) => TE.right(r.results),
      0,
      50,
    );
  };
