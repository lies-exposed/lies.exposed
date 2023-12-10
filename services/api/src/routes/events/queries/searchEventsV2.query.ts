// https://www.postgresql.org/docs/12/functions-json.html

import { type DBError } from "@liexp/backend/lib/providers/orm/index.js";
import { fp , pipe } from "@liexp/core/lib/fp/index.js";
import { type EventTotals } from "@liexp/shared/lib/io/http/Events/EventTotals.js";
import {
  EventTypes,
  type EventType,
} from "@liexp/shared/lib/io/http/Events/EventType.js";
import { type GetSearchEventsQuery } from "@liexp/shared/lib/io/http/Events/SearchEvents/SearchEventsQuery.js";
import { walkPaginatedRequest } from "@liexp/shared/lib/utils/fp.utils.js";
import { sequenceS } from "fp-ts/lib/Apply.js";
import * as A from "fp-ts/lib/Array.js";
import * as O from "fp-ts/lib/Option.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Brackets, In, type SelectQueryBuilder } from "typeorm";
import { type RouteContext } from "../../route.types.js";
import { EventV2Entity } from "#entities/Event.v2.entity.js";
import { GroupMemberEntity } from "#entities/GroupMember.entity.js";
import { type ControllerError } from "#io/ControllerError.js";
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
  title: O.none,
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
};

export interface SearchEventOutput {
  results: EventV2Entity[];
  totals: EventTotals;
  total: number;
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
      title,
      startDate,
      endDate,
      withDeleted,
      withDrafts,
      draft,
      emptyLinks,
      emptyMedia,
      spCount,
      onlyUnshared: _onlyUnshared,
      order,
      skip,
      take,
    } = opts;

    const onlyUnshared = pipe(
      _onlyUnshared,
      fp.O.filter((o) => !!o),
    );

    const groupsMembersQuery = pipe(
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
    );

    return pipe(
      groupsMembersQuery,
      TE.chain((groupsMembers) => {
        logger.debug.log(
          `Find options for event (type: %s) %O`,
          O.toUndefined(type),
          {
            title,
            exclude,
            startDate,
            endDate,
            actors,
            groups,
            groupsMembers,
            keywords,
            links,
            media,
            order,
            skip,
            take,
          },
        );

        const searchV2Query = pipe(
          db.manager
            .createQueryBuilder(EventV2Entity, "event")
            .leftJoinAndSelect("event.keywords", "keywords")
            .leftJoinAndSelect("event.media", "media")
            .leftJoinAndSelect("event.links", "links")
            .leftJoinAndSelect(
              leftJoinSocialPosts("events"),
              "socialPosts",
              '"socialPosts"."socialPosts_entity" = event.id',
            ),
          (q) => {
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
              q = whereInTitle(config.events)(q, title.value);
            }

            q.andWhere(
              new Brackets((qb) => {
                if (O.isSome(startDate)) {
                  const where = hasWhere
                    ? qb.andWhere.bind(qb)
                    : qb.where.bind(qb);
                  where("event.date >= :startDate", {
                    startDate: startDate.value.toDateString(),
                  });
                  hasWhere = true;
                }

                if (O.isSome(endDate)) {
                  const where = hasWhere
                    ? qb.andWhere.bind(qb)
                    : qb.where.bind(qb);
                  where("event.date <= :endDate", {
                    endDate: endDate.value.toDateString(),
                  });
                  hasWhere = true;
                }

                let hasWhereActor = false;
                if (O.isSome(actors)) {
                  whereActorInArray(config.events)(
                    q,
                    actors.value,
                    type,
                    hasWhere ? "AND" : undefined,
                  );
                  hasWhere = true;
                  hasWhereActor = true;
                }

                if (O.isSome(groups)) {
                  const whereT = hasWhereActor
                    ? "OR"
                    : hasWhere
                      ? "AND"
                      : undefined;
                  whereGroupInArray(config.events)(
                    q,
                    groups.value,
                    type,
                    whereT,
                  );
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
                  locationQb.where(
                    ` (event.type = 'Uncategorized' AND "event"."payload"::jsonb -> 'location' ?| ARRAY[:...locations]) `,
                  );
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
              q.andWhere(
                '"socialPosts_spCount" < 1 OR "socialPosts_spCount" IS NULL',
              );
            }

            if (O.isSome(draft)) {
              q.andWhere("event.draft = :draft", { draft: draft.value });
            } else if (!withDrafts) {
              q.andWhere("event.draft = false");
            }
            return q;
          },
          (q) => {
            if (withDeleted) {
              q.withDeleted();
            }

            q.cache(true);

            if (order !== undefined) {
              addOrder(order, q, "event");
            }

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

        return sequenceS(fp.TE.ApplicativePar)({
          results: db.execQuery(async () => {
            const resultQ = searchV2Query.resultsQuery
              .loadAllRelationIds({
                relations: ["keywords", "links", "media"],
              })
              .skip(skip)
              .take(take);

            if (skip === 0 && take === 0) {
              return [];
            }

            // logger.debug.log("Result query %s", resultQ.getSql());

            const results = await resultQ.getRawAndEntities();

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
            searchV2Query.uncategorizedCount.getCount(),
          ),
          deaths: db.execQuery(() => searchV2Query.deathsCount.getCount()),
          scientificStudies: db.execQuery(() =>
            searchV2Query.scientificStudiesCount.getCount(),
          ),
          patents: db.execQuery(() => searchV2Query.patentCount.getCount()),
          documentaries: db.execQuery(() =>
            searchV2Query.documentariesCount.getCount(),
          ),
          transactions: db.execQuery(() =>
            searchV2Query.transactionsCount.getCount(),
          ),
          quotes: db.execQuery(() => searchV2Query.quotesCount.getCount()),
          books: db.execQuery(() => searchV2Query.booksCount.getCount()),
        });
      }),
      TE.map(({ results, ...totals }) => ({
        results,
        totals,
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
      (r) => r.results,
      0,
      50,
    );
  };
