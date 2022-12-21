// https://www.postgresql.org/docs/12/functions-json.html

import { QUOTE } from "@liexp/shared/io/http/Events/Quote";
import { EventTotals } from "@liexp/shared/io/http/Events/SearchEventsQuery";
import { DBError } from "@liexp/shared/providers/orm/Database";
import { sequenceS } from "fp-ts/Apply";
import * as A from "fp-ts/Array";
import * as O from "fp-ts/Option";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { Brackets, In, SelectQueryBuilder } from "typeorm";
import { RouteContext } from "../../route.types";
import { EventV2Entity } from "@entities/Event.v2.entity";
import { GroupMemberEntity } from "@entities/GroupMember.entity";
import { addOrder } from "@utils/orm.utils";

type WhereT = "AND" | "OR";

const getWhere = (
  q: SelectQueryBuilder<EventV2Entity>,
  whereT?: WhereT
): typeof q.where | typeof q.andWhere | typeof q.orWhere => {
  return whereT === "AND"
    ? q.andWhere.bind(q)
    : whereT === "OR"
    ? q.orWhere.bind(q)
    : q.where.bind(q);
};

export const whereActorInArray = (
  q: SelectQueryBuilder<EventV2Entity>,
  actors: string[],
  whereT?: WhereT
): SelectQueryBuilder<EventV2Entity> => {
  const where = getWhere(q, whereT);
  where(
    new Brackets((q) => {
      q.where(
        new Brackets((qqb) => {
          qqb
            .where(" event.type = 'Uncategorized' ")
            .andWhere(
              `"event"."payload"::jsonb -> 'actors' ?| ARRAY[:...actors] `
            );
        })
      )
        .orWhere(
          new Brackets((qb) => {
            qb.where(" event.type = 'Death' ").andWhere(
              ` "event"."payload"::jsonb -> 'victim' ?| ARRAY[:...actors] `
            );
          })
        )
        .orWhere(
          new Brackets((qb) => {
            qb.where(" event.type = 'Documentary' ").andWhere(
              `( "event"."payload"::jsonb -> 'subjects' -> 'actors' ?| ARRAY[:...actors] OR "event"."payload"::jsonb -> 'authors' -> 'actors' ?| ARRAY[:...actors] )`
            );
          })
        )
        .orWhere(
          new Brackets((qb) => {
            qb.where(" event.type = 'ScientificStudy' ").andWhere(
              ` "event"."payload"::jsonb -> 'authors' ?| ARRAY[:...actors] `
            );
          })
        )
        .orWhere(
          new Brackets((qb) => {
            qb.where(" event.type = 'Patent' ").andWhere(
              ` "event"."payload"::jsonb -> 'owners' -> 'actors' ?| ARRAY[:...actors] `
            );
          })
        )
        .orWhere(
          new Brackets((qb) => {
            qb.where(" event.type = 'Transaction' ").andWhere(
              `( ("event"."payload"::jsonb -> 'from' ->> 'type' = 'Actor' AND "event"."payload"::jsonb -> 'from' -> 'id' ?| ARRAY[:...actors]) OR ` +
                ` ("event"."payload"::jsonb -> 'to' ->> 'type' = 'Actor' AND "event"."payload"::jsonb -> 'to' -> 'id' ?| ARRAY[:...actors]) )`
            );
          })
        )
        .orWhere(
          new Brackets((qb) => {
            qb.where(` event.type = '${QUOTE.value}' `).andWhere(
              ` ("event"."payload"::jsonb -> 'actor' ?| ARRAY[:...actors]) `
            );
          })
        )
        ;
    })
  );
  q.setParameter("actors", actors);
  return q;
};

export const whereGroupInArray = (
  q: SelectQueryBuilder<EventV2Entity>,
  groups: string[],
  whereT?: WhereT
): SelectQueryBuilder<EventV2Entity> => {
  const where = getWhere(q, whereT);
  where(
    new Brackets((qq) => {
      qq.where(
        ` (event.type = 'Uncategorized' AND "event"."payload"::jsonb -> 'groups' ?| ARRAY[:...groups]) `
      )
        .orWhere(
          ` (event.type = 'ScientificStudy' AND "event"."payload"::jsonb -> 'publisher' ?| ARRAY[:...groups])`
        )
        .orWhere(
          `(event.type = 'Documentary' AND ( "event"."payload"::jsonb -> 'subjects' -> 'groups' ?| ARRAY[:...groups] OR "event"."payload"::jsonb -> 'authors' -> 'groups' ?| ARRAY[:...groups] ) )`
        )
        .orWhere(
          ` (event.type = 'Patent' AND "event"."payload"::jsonb -> 'owners' -> 'groups' ?| ARRAY[:...groups])`
        )
        .orWhere(
          new Brackets((qb) => {
            qb.where(" event.type = 'Transaction' ").andWhere(
              `( ("event"."payload"::jsonb -> 'from' ->> 'type' = 'Group' AND "event"."payload"::jsonb -> 'from' -> 'id' ?| ARRAY[:...groups]) OR ` +
                ` ("event"."payload"::jsonb -> 'to' ->> 'type' = 'Group' AND "event"."payload"::jsonb -> 'to' -> 'id' ?| ARRAY[:...groups]) )`
            );
          })
        );
    })
  );

  return q.setParameter("groups", groups);
};

interface SearchEventQuery {
  ids: O.Option<string[]>;
  actors: O.Option<string[]>;
  groups: O.Option<string[]>;
  groupsMembers: O.Option<string[]>;
  keywords: O.Option<string[]>;
  links: O.Option<string[]>;
  media: O.Option<string[]>;
  locations: O.Option<string[]>;
  type: O.Option<string[]>;
  title: O.Option<string>;
  draft: O.Option<boolean>;
  startDate: O.Option<Date>;
  endDate: O.Option<Date>;
  exclude: O.Option<string[]>;
  withDeleted: boolean;
  withDrafts: boolean;
  skip: number;
  take: number;
  order?: Record<string, "ASC" | "DESC">;
}

export interface SearchEventOutput {
  results: EventV2Entity[];
  totals: EventTotals;
  total: number;
}

export const searchEventV2Query =
  ({ db, logger }: RouteContext) =>
  ({
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
    order,
    skip,
    take,
  }: SearchEventQuery): TE.TaskEither<DBError, SearchEventOutput> => {
    const groupsMembersQuery = pipe(
      O.isSome(actors)
        ? pipe(
            db.find(GroupMemberEntity, {
              where: {
                actor: { id: In(actors.value) },
              },
            }),
            TE.map(A.map((gm) => gm.id))
          )
        : TE.right<DBError, string[]>([]),
      TE.map((gm) =>
        O.isSome(_groupsMembers) ? gm.concat(..._groupsMembers.value) : gm
      )
    );

    return pipe(
      groupsMembersQuery,
      TE.chain((groupsMembers) => {
        logger.debug.log(
          `Find options for event (type: %O) %O`,
          O.toUndefined(type),
          {
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
          }
        );

        const searchV2Query = pipe(
          db.manager
            .createQueryBuilder(EventV2Entity, "event")
            .leftJoinAndSelect("event.keywords", "keywords")
            .leftJoinAndSelect("event.media", "media")
            .leftJoinAndSelect("event.links", "links"),
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
            }

            if (O.isSome(title)) {
              const trimmedWords = title.value
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

              q.andWhere(
                `ts_rank_cd(
                  to_tsvector(
                    'english',
                    coalesce(
                      CASE
                        WHEN event.type IN ('Uncategorized', 'Documentary', 'ScientificStudy', 'Patent') THEN "event"."payload"::jsonb ->> 'title'
                        WHEN event.type IN ('Death') THEN "event"."payload"::jsonb ->> 'victim'::text
                        WHEN event.type IN (${QUOTE.value}) THEN "event"."payload"::jsonb ->> 'quote'::text

                      END, ''
                    )
                  ),
                  to_tsquery('english', :q)
                ) > 0.001`,
                {
                  q: tsQueryTitle,
                }
              );

              hasWhere = true;
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
                  whereActorInArray(
                    q,
                    actors.value,
                    hasWhere ? "AND" : undefined
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
                  whereGroupInArray(q, groups.value, whereT);
                }

                if (groupsMembers.length > 0) {
                  qb.orWhere(
                    `( event.type = 'Uncategorized' AND "event"."payload"::jsonb -> 'groupsMembers' ?| ARRAY[:...groupsMembers] )`,
                    {
                      groupsMembers,
                    }
                  );
                }
              })
            );

            if (O.isSome(locations)) {
              q.andWhere(
                new Brackets((locationQb) => {
                  locationQb.where(
                    ` (event.type = 'Uncategorized' AND "event"."payload"::jsonb -> 'location' ?| ARRAY[:...locations]) `
                  );
                })
              );

              q.setParameter("locations", locations.value);
            }

            if (O.isSome(keywords)) {
              q.andWhere("keywords.id IN (:...keywords)", {
                keywords: keywords.value,
              });
            }

            if (O.isSome(media)) {
              q.andWhere("media.id IN (:...media)", {
                media: media.value,
              });
            }

            if (O.isSome(links)) {
              const where = hasWhere ? q.andWhere.bind(q) : q.andWhere.bind(q);
              where("links.id IN (:...links)", {
                links: links.value,
              });
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
              .andWhere(`event.type = '${QUOTE.value}'`);

            if (O.isSome(type)) {
              q.andWhere("event.type::text IN (:...types)", {
                types: type.value,
              });
            }

            // logger.debug.log(
            //   `Search event v2 query %s with params %O`,
            //   ...q.getQueryAndParameters()
            // );

            return {
              resultsQuery: q,
              uncategorizedCount,
              deathsCount,
              scientificStudiesCount,
              patentCount,
              documentariesCount,
              transactionsCount,
              quotesCount,
            };
          }
        );

        return sequenceS(TE.ApplicativePar)({
          results: db.execQuery(async () => {
            const resultQ = searchV2Query.resultsQuery
              .loadAllRelationIds({ relations: ["keywords", "links", "media"] })
              .skip(skip)
              .take(take);

            if (skip === 0 && take === 0) {
              return [];
            }

            // logger.debug.log("Result query %s", resultQ.getSql());

            const results = await resultQ.getRawAndEntities();

            // logger.debug.log("Raw results %O", results);

            return results.entities;
          }),
          uncategorized: db.execQuery(() =>
            searchV2Query.uncategorizedCount.getCount()
          ),
          deaths: db.execQuery(() => searchV2Query.deathsCount.getCount()),
          scientificStudies: db.execQuery(() =>
            searchV2Query.scientificStudiesCount.getCount()
          ),
          patents: db.execQuery(() => searchV2Query.patentCount.getCount()),
          documentaries: db.execQuery(() =>
            searchV2Query.documentariesCount.getCount()
          ),
          transactions: db.execQuery(() =>
            searchV2Query.transactionsCount.getCount()
          ),
          quotes: db.execQuery(() => searchV2Query.quotesCount.getCount()),
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
          totals.quotes,
      }))
    );
  };
